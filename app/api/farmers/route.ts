import { desc, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, farmers } from "../../../db/schema";
import { getRegistrationAccess } from "../registration-access";
import { realtimeBus } from "../../../lib/realtime-bus";

export const dynamic = "force-dynamic";

const database = () => getDb();

export async function GET(request: NextRequest) {
  const db = await database();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const rows = q
    ? await db.select().from(farmers).where(or(like(farmers.firstName, `%${q}%`), like(farmers.lastName, `%${q}%`), like(farmers.dfrId, `%${q}%`), like(farmers.county, `%${q}%`))).orderBy(desc(farmers.createdAt))
    : await db.select().from(farmers).orderBy(desc(farmers.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const access=await getRegistrationAccess();
  if(!access.user)return NextResponse.json({error:"Authentication required."},{status:401});
  if(!access.allowed)return NextResponse.json({error:"Your assigned role does not permit registry creation."},{status:403});
  const db = await database();
  const body = await request.json();
  const required = ["firstName","lastName","gender","county","district","community","crop"];
  if (required.some(k => !String(body[k] ?? "").trim())) return NextResponse.json({ error:"Complete all required fields." }, { status:400 });
  const prefix = String(body.county).slice(0,2).toUpperCase();
  const provisionalId = `PROV-${prefix}-${Date.now().toString().slice(-7)}`;
  const dfrId = provisionalId;
  const record = { dfrId, provisionalId, approvedDfrId:"", firstName:String(body.firstName), lastName:String(body.lastName), gender:String(body.gender), phone:String(body.phone??""), county:String(body.county), district:String(body.district), community:String(body.community), crop:String(body.crop), farmSize:Number(body.farmSize??0), vulnerability:String(body.vulnerability??"Standard"), roadAccess:String(body.roadAccess??""), roadCondition:String(body.roadCondition??""), roadSeasonality:String(body.roadSeasonality??""), roadDistanceMiles:Number(body.roadDistanceMiles??0), processingAccess:String(body.processingAccess??""), processingFacilityType:String(body.processingFacilityType??""), processingFacilityName:String(body.processingFacilityName??""), processingFacilityStatus:String(body.processingFacilityStatus??""), processingDistanceMiles:Number(body.processingDistanceMiles??0), processingTravelMinutes:Number(body.processingTravelMinutes??0), processingTransportMode:String(body.processingTransportMode??""), latitude:body.latitude?Number(body.latitude):null, longitude:body.longitude?Number(body.longitude):null };
  await db.insert(farmers).values(record);
  await db.insert(auditEvents).values({ actor:access.user.email, action:"Provisional registration created", entity:provisionalId, details:`${access.assignment?.role}: ${record.firstName} ${record.lastName}, ${record.county}; official DFR ID pending approval` });
  
  // Publish real-time event
  realtimeBus.publish("farmer:created", { ...record, status: "Pending verification" });
  realtimeBus.publish("audit:logged", { actor: access.user.email, action: "Provisional registration created", entity: provisionalId });

  return NextResponse.json({ ...record, status:"Pending verification" }, { status:201 });
}
