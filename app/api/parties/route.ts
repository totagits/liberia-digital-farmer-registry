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
export const dynamic = "force-dynamic";
const seeds = [
  {
    partyId: "ORG-COOP-00041",
    partyType: "Cooperative",
    legalName: "Grand Bassa Youth Cassava Cooperative",
    acronym: "GBYCC",
    legalForm: "Registered cooperative",
    registrationNumber: "CDA-GB-2024-118",
    taxId: "500-881-240",
    representativeName: "Rebecca Doe",
    phone: "0777 210 440",
    email: "secretariat@gbycc.lr",
    county: "Grand Bassa",
    district: "District 1",
    community: "Buchanan Rural",
    memberCount: 64,
    womenMembers: 37,
    youthMembers: 52,
    primaryCommodity: "Cassava",
    verificationStatus: "Verified",
    metadata: JSON.stringify({
      boardMembers: 7,
      governance: "Board and General Assembly",
      markets: ["Buchanan", "Monrovia"],
    }),
  },
  {
    partyId: "ORG-GRP-00072",
    partyType: "Farmer group / informal association",
    legalName: "Kpatawee Lowland Rice Farmers Group",
    legalForm: "Informal farmer group",
    representativeName: "Morris Kollie",
    phone: "0886 441 103",
    county: "Bong",
    district: "Suakoko",
    community: "Kpatawee",
    memberCount: 28,
    womenMembers: 17,
    youthMembers: 11,
    primaryCommodity: "Rice – lowland paddy",
    verificationStatus: "Verified",
    metadata: JSON.stringify({
      constitution: "Community rules",
      meetingFrequency: "Monthly",
    }),
  },
  {
    partyId: "ORG-AGR-00018",
    partyType: "Agribusiness enterprise",
    legalName: "Nimba Cocoa Aggregation and Processing Ltd",
    acronym: "NCAP",
    legalForm: "Liberian corporation",
    registrationNumber: "LBR-BC-992118",
    taxId: "500-340-119",
    representativeName: "Anthony Kromah",
    phone: "0770 811 292",
    email: "operations@ncap.lr",
    county: "Nimba",
    district: "Sanniquellie-Mahn",
    community: "Ganta Highway",
    memberCount: 0,
    primaryCommodity: "Cocoa",
    verificationStatus: "Pending verification",
    metadata: JSON.stringify({
      employees: 21,
      ownership: "Private",
      services: ["Aggregation", "Fermentation", "Drying"],
    }),
  },
  {
    partyId: "ORG-PO-00012",
    partyType: "Producer organization",
    legalName: "Lofa Women Horticulture Producers Union",
    acronym: "LWHU",
    legalForm: "Producer organization",
    registrationNumber: "MOA-PO-2025-44",
    representativeName: "Martha Kortimai",
    phone: "0888 151 200",
    county: "Lofa",
    district: "Voinjama",
    community: "Voinjama",
    memberCount: 112,
    womenMembers: 104,
    youthMembers: 46,
    primaryCommodity: "Vegetables and horticulture",
    verificationStatus: "Verified",
    metadata: JSON.stringify({
      chapters: 5,
      governance: "Executive committee",
    }),
  },
  {
    partyId: "ORG-SVC-00009",
    partyType: "Service provider / supplier",
    legalName: "Liberia Farm Mechanization Services",
    acronym: "LFMS",
    legalForm: "Liberian business",
    registrationNumber: "LBR-BC-771902",
    taxId: "500-992-012",
    representativeName: "George Fahnbulleh",
    phone: "0776 390 001",
    county: "Montserrado",
    district: "Greater Monrovia",
    community: "Paynesville",
    primaryCommodity: "Mechanization services",
    verificationStatus: "Verified",
    metadata: JSON.stringify({
      services: ["Land preparation", "Harvesting", "Transport"],
    }),
  },
] as const;
async function ensureSeed() {
  const db = await getDb();
  /* Historical sample definitions are intentionally not inserted. New records
     must originate from an authenticated, authorized registration workflow. */
  if (false && !(await db.select({ id: parties.id }).from(parties).limit(1)).length) {
    await db.insert(parties).values(seeds as any);
    await db.insert(partyRelationships).values([
      {
        fromPartyId: "ORG-COOP-00041",
        toPartyId: "LBR-GB-000103",
        relationshipType: "Member",
        roleTitle: "Member farmer",
        startDate: "2025-02-01",
      },
      {
        fromPartyId: "ORG-PO-00012",
        toPartyId: "LBR-NI-000067",
        relationshipType: "Member",
        roleTitle: "Producer member",
        startDate: "2025-06-12",
      },
    ]);
    await db.insert(partyResources).values([
      {
        partyId: "ORG-COOP-00041",
        resourceType: "Facility",
        name: "Cassava processing unit",
        category: "Processing",
        capacity: "2 tonnes/day",
        county: "Grand Bassa",
        status: "Operational",
      },
      {
        partyId: "ORG-AGR-00018",
        resourceType: "Equipment",
        name: "Cocoa dryer",
        category: "Post-harvest",
        quantity: 2,
        unit: "units",
        capacity: "1.5 tonnes/batch",
        county: "Nimba",
        status: "Operational",
      },
      {
        partyId: "ORG-PO-00012",
        resourceType: "Farm / parcel",
        name: "Union demonstration farm",
        category: "Horticulture",
        quantity: 6.5,
        unit: "hectares",
        county: "Lofa",
        latitude: 8.421,
        longitude: -9.748,
        status: "Active",
      },
    ]);
    await db.insert(partyActivities).values([
      {
        partyId: "ORG-COOP-00041",
        activityType: "Production",
        commodity: "Cassava",
        volume: 186,
        unit: "tonnes",
        value: 43800,
        currency: "USD",
        activityDate: "2026-06-30",
        status: "Verified",
      },
      {
        partyId: "ORG-AGR-00018",
        activityType: "Market transaction",
        commodity: "Cocoa",
        volume: 42,
        unit: "tonnes",
        value: 126000,
        currency: "USD",
        counterparty: "Regional exporter",
        activityDate: "2026-05-18",
        status: "Recorded",
      },
    ]);
    await db
      .insert(auditEvents)
      .values({
        actor: "System",
        action: "Unified Party Registry initialized",
        entity: "Organizations",
        details:
          "Cooperatives, groups, producer organizations, agribusinesses and service providers established as first-class subjects",
      });
  }
  return db;
}
export async function GET(req: NextRequest) {
  const db = await ensureSeed();
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
  const db = await ensureSeed();
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
  return NextResponse.json({ ok: true, partyId }, { status: 201 });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const access=await getRegistrationAccess();
  if(!access.user)return NextResponse.json({error:"Authentication required."},{status:401});
  const verificationRoles=new Set(["Verification officer","County agricultural officer","Ministry administrator"]);
  const mayVerify=!!access.assignment&&access.assignment.status==="Active"&&verificationRoles.has(access.assignment.role);
  if((b.verificationStatus&&!mayVerify)||(!b.verificationStatus&&!access.allowed))return NextResponse.json({error:"Your assigned role does not permit this organization action."},{status:403});
  const db = await ensureSeed();
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
  return NextResponse.json({ ok: true });
}
