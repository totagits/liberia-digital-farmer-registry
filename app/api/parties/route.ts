import { desc, eq, like, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import {
  auditEvents,
  parties,
  partyActivities,
  partyDocuments,
  partyRelationships,
  partyResources,
} from "../../../db/schema";
import { getRegistrationAccess } from "../registration-access";
import { realtimeBus } from "../../../lib/realtime-bus";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const type = req.nextUrl.searchParams.get("type")?.trim();
  let rows;
  if (q)
    rows = await db
      .select()
      .from(parties)
      .where(
        or(
          like(parties.legalName, `%${q}%`),
          like(parties.partyId, `%${q}%`),
          like(parties.registrationNumber, `%${q}%`),
          like(parties.county, `%${q}%`),
        ),
      )
      .orderBy(desc(parties.createdAt));
  else if (type)
    rows = await db
      .select()
      .from(parties)
      .where(eq(parties.partyType, type))
      .orderBy(desc(parties.createdAt));
  else rows = await db.select().from(parties).orderBy(desc(parties.createdAt));
  const [rels, res, acts, docs, audits] = await Promise.all([
    db.select().from(partyRelationships),
    db.select().from(partyResources),
    db.select().from(partyActivities),
    db.select().from(partyDocuments),
    db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)),
  ]);
  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      metadata: JSON.parse(r.metadata || "{}"),
      relationships: rels.filter(
        (x) => x.fromPartyId === r.partyId || x.toPartyId === r.partyId,
      ),
      resources: res.filter((x) => x.partyId === r.partyId),
      activities: acts.filter((x) => x.partyId === r.partyId),
      documents: docs.filter((x) => x.partyId === r.partyId),
      audits: audits.filter((x)=>x.entity===r.partyId),
    })),
  );
}
export async function POST(req: NextRequest) {
  const access = await getRegistrationAccess();
  if (!access.user)
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!access.allowed)
    return NextResponse.json(
      { error: "Your assigned role does not permit registry creation." },
      { status: 403 },
    );
  const b = await req.json();
  const db = await getDb();
  const prefixes: Record<string, string> = {
    "Farmer group / informal association": "GRP",
    Cooperative: "COOP",
    "Producer organization": "PO",
    "Agribusiness enterprise": "AGR",
    "Service provider": "SVC",
    "Supplier": "SUP",
    "Financial institution": "FIN",
    "Government / partner programme": "PRG",
    "Farmer household": "HH",
    "Individual farmer / farm worker": "FMR",
  };
  const partyId = `ORG-${prefixes[b.partyType] || "ENT"}-${Date.now().toString().slice(-5)}`;
  const duplicate = await db
    .select()
    .from(parties)
    .where(
      or(
        like(parties.legalName, String(b.legalName)),
        b.registrationNumber
          ? eq(parties.registrationNumber, String(b.registrationNumber))
          : eq(parties.partyId, "__none__"),
      ),
    )
    .limit(5);
  if (duplicate.length)
    return NextResponse.json(
      {
        error: "Potential duplicate organization detected.",
        matches: duplicate,
      },
      { status: 409 },
    );
  const metadata = {
    governance: b.governanceBody || b.governance || "",
    boardMembers: +b.boardMembers || 0,
    employees: +b.employees || 0,
    householdsRepresented: +b.householdsRepresented || 0,
    serviceCounties: String(b.serviceCounties||"").split(",").map((x:string)=>x.trim()).filter(Boolean),
    processingCapacity: b.processingCapacity||"",
    servicePoints: +b.servicePoints||0,
    facilitySummary: b.facilitySummary||"",
    compliance: {
      cdaCertificateNumber:b.cdaCertificateNumber||"",
      certificationStatus:b.certificationStatus||"",
      certificateIssueDate:b.certificateIssueDate||"",
      certificateExpiryDate:b.certificateExpiryDate||"",
      businessLicenseNumber:b.businessLicenseNumber||"",
      businessLicenseExpiry:b.businessLicenseExpiry||"",
      sectorPermit:b.sectorPermit||"",
      permitAuthority:b.permitAuthority||"",
      cbLLicenseNumber:b.cbLLicenseNumber||"",
      financialLicenseCategory:b.financialLicenseCategory||"",
      institutionCode:b.institutionCode||"",
      financialLicenseExpiry:b.financialLicenseExpiry||"",
      constitutionReference:b.constitutionReference||"",
      recognizingAuthority:b.recognizingAuthority||"",
    },
    services: String(b.services || "")
      .split(",")
      .map((x: string) => x.trim())
      .filter(Boolean),
  };
  await db
    .insert(parties)
    .values({
      partyId,
      partyType: b.partyType,
      legalName: b.legalName,
      acronym: b.acronym || "",
      legalForm: b.legalForm || "",
      registrationNumber: b.registrationNumber || "",
      taxId: b.taxId || "",
      establishedDate: b.establishedDate || "",
      representativeName: b.representativeName || "",
      phone: b.phone || "",
      email: b.email || "",
      county: b.county,
      district: b.district,
      community: b.community,
      memberCount: +b.memberCount || 0,
      womenMembers: +b.womenMembers || 0,
      youthMembers: +b.youthMembers || 0,
      primaryCommodity: b.primaryCommodity || "",
      metadata: JSON.stringify(metadata),
    });
  const complianceDocuments=[
    b.cdaCertificateNumber&&{partyId,documentType:"CDA certificate",documentNumber:b.cdaCertificateNumber,issuedBy:"Cooperative Development Agency",issueDate:b.certificateIssueDate||"",expiryDate:b.certificateExpiryDate||"",verificationStatus:b.certificationStatus||"Pending validation"},
    b.businessLicenseNumber&&{partyId,documentType:"Business registration / operating licence",documentNumber:b.businessLicenseNumber,issuedBy:"Ministry of Commerce and Industry",expiryDate:b.businessLicenseExpiry||"",verificationStatus:"Pending validation"},
    b.cbLLicenseNumber&&{partyId,documentType:"Financial institution licence",documentNumber:b.cbLLicenseNumber,issuedBy:"Central Bank of Liberia",expiryDate:b.financialLicenseExpiry||"",verificationStatus:"Pending validation"},
    b.constitutionReference&&{partyId,documentType:"Constitution / bylaws",documentNumber:b.constitutionReference,issuedBy:b.recognizingAuthority||"Local authority",verificationStatus:"Pending validation"},
  ].filter(Boolean) as any[];
  if(complianceDocuments.length)await db.insert(partyDocuments).values(complianceDocuments);
  await db
    .insert(auditEvents)
    .values({
      actor: "Party Registry Officer",
      action: "Organization registered",
      entity: partyId,
      details: `${b.partyType}: ${b.legalName}`,
    });

  realtimeBus.publish("party:registered", { partyId, legalName: b.legalName, partyType: b.partyType, county: b.county });
  realtimeBus.publish("audit:logged", { actor: "Party Registry Officer", action: "Organization registered", entity: partyId });

  return NextResponse.json({ ok: true, partyId }, { status: 201 });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const access=await getRegistrationAccess();
  if(!access.user)return NextResponse.json({error:"Authentication required."},{status:401});
  const verificationRoles=new Set(["Verification officer","County agricultural officer","Ministry administrator"]);
  const mayVerify=!!access.assignment&&access.assignment.status==="Active"&&verificationRoles.has(access.assignment.role);
  if((b.verificationStatus&&!mayVerify)||(!b.verificationStatus&&!access.allowed))return NextResponse.json({error:"Your assigned role does not permit this organization action."},{status:403});
  const db = await getDb();
  const changes:Record<string,unknown>={updatedAt:sql`CURRENT_TIMESTAMP`};
  for(const key of ["verificationStatus","legalName","representativeName","phone","email","primaryCommodity"]){if(b[key]!==undefined)changes[key]=b[key]}
  await db
    .update(parties)
    .set(changes)
    .where(eq(parties.partyId, String(b.partyId)));
  await db
    .insert(auditEvents)
    .values({
      actor: "Organization Verification Officer",
      action: b.verificationStatus?"Organization verification updated":"Organization profile updated",
      entity: b.partyId,
      details: b.verificationStatus||"Governed profile fields changed",
    });

  realtimeBus.publish("party:verified", { partyId: b.partyId, verificationStatus: b.verificationStatus });

  return NextResponse.json({ ok: true });
}
