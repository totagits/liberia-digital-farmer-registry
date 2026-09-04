import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../db";
import {
  auditEvents,
  partyActivities,
  partyDocuments,
  partyRelationships,
  partyResources,
} from "../../../../db/schema";
import { getRegistrationAccess } from "../../registration-access";
export async function POST(req: NextRequest) {
  const access = await getRegistrationAccess();
  if (!access.user)
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!access.allowed)
    return NextResponse.json(
      { error: "Your assigned role does not permit organization record creation." },
      { status: 403 },
    );
  const b = await req.json();
  const db = await getDb();
  if (b.recordType === "relationship")
    await db
      .insert(partyRelationships)
      .values({
        fromPartyId: b.partyId,
        toPartyId: b.toPartyId,
        relationshipType: b.relationshipType,
        roleTitle: b.roleTitle || "",
        startDate: b.startDate || "",
      });
  else if (b.recordType === "resource")
    await db
      .insert(partyResources)
      .values({
        partyId: b.partyId,
        resourceType: b.resourceType,
        name: b.name,
        category: b.category || "",
        quantity: +b.quantity || 0,
        unit: b.unit || "",
        capacity: b.capacity || "",
        county: b.county || "",
        latitude: b.latitude ? +b.latitude : null,
        longitude: b.longitude ? +b.longitude : null,
        status: b.status || "Operational",
        details: b.details || "",
      });
  else if (b.recordType === "activity")
    await db
      .insert(partyActivities)
      .values({
        partyId: b.partyId,
        activityType: b.activityType,
        programme: b.programme || "",
        commodity: b.commodity || "",
        volume: +b.volume || 0,
        unit: b.unit || "",
        value: +b.value || 0,
        currency: b.currency || "USD",
        counterparty: b.counterparty || "",
        activityDate: b.activityDate,
        status: b.status || "Recorded",
        details: b.details || "",
      });
  else if(b.recordType==="document")
    await db.insert(partyDocuments).values({partyId:b.partyId,documentType:b.documentType,documentNumber:b.documentNumber||"",issuedBy:b.issuedBy||"",issueDate:b.issueDate||"",expiryDate:b.expiryDate||"",verificationStatus:"Pending",fileName:b.fileName||"",objectKey:""});
  else
    return NextResponse.json({ error: "Unknown record type" }, { status: 400 });
  await db
    .insert(auditEvents)
    .values({
      actor: "Party Registry Officer",
      action: `Organization ${b.recordType} recorded`,
      entity: b.partyId,
      details: b.name || b.relationshipType || b.activityType,
    });
  return NextResponse.json({ ok: true }, { status: 201 });
}
