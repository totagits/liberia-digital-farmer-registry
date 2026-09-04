import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../db";
import { auditEvents, farmers } from "../../../../db/schema";
import { realtimeBus } from "../../../../lib/realtime-bus";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id:string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const allowed = ["Verified","Pending verification","Needs correction"];
  if (!allowed.includes(body.status)) return NextResponse.json({ error:"Invalid status" }, { status:400 });
  const db = await getDb();
  const row=(await db.select().from(farmers).where(eq(farmers.id,Number(id))).limit(1))[0];
  if(!row)return NextResponse.json({error:"Record not found"},{status:404});
  const approvedDfrId=body.status==="Verified"&&!row.approvedDfrId?`LBR-${row.county.slice(0,2).toUpperCase()}-${String(row.id).padStart(7,"0")}`:row.approvedDfrId;
  await db.update(farmers).set({ status:body.status, approvedDfrId, updatedAt:sql`CURRENT_TIMESTAMP` }).where(eq(farmers.id, Number(id)));
  await db.insert(auditEvents).values({ actor:"Verification Officer", action:body.status==="Verified"?"Official DFR ID approved":`Record ${body.status.toLowerCase()}`, entity:approvedDfrId||row.provisionalId||`Farmer #${id}`, details:String(body.note??"Status updated through verification workflow") });

  // Publish real-time event
  realtimeBus.publish("farmer:verified", { id: Number(id), status: body.status, approvedDfrId, provisionalId: row.provisionalId });
  realtimeBus.publish("audit:logged", { actor: "Verification Officer", action: body.status === "Verified" ? "Official DFR ID approved" : `Record ${body.status.toLowerCase()}`, entity: approvedDfrId || row.provisionalId });

  return NextResponse.json({ ok:true,provisionalId:row.provisionalId,approvedDfrId });
}
