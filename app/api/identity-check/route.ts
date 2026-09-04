import { like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, farmers, identityChecks } from "../../../db/schema";

export async function POST(req:NextRequest){
  const b=await req.json(); const db=await getDb(); const name=String(b.name||"").trim(); const phone=String(b.phone||"").trim();
  const parts=name.split(/\s+/); const matches=await db.select().from(farmers).where(or(like(farmers.phone,phone||"__none__"),like(farmers.firstName,`%${parts[0]||"__none__"}%`),like(farmers.lastName,`%${parts.at(-1)||"__none__"}%`))).limit(10);
  const exactPhone=matches.some(m=>phone&&m.phone===phone); const exactName=matches.some(m=>`${m.firstName} ${m.lastName}`.toLowerCase()===name.toLowerCase()); const risk=Math.min(100,(exactPhone?70:0)+(exactName?25:0)+(matches.length>1?5:0)); const outcome=risk>=70?"Potential duplicate":"No material duplicate detected";
  await db.insert(identityChecks).values({farmerDfrId:String(b.farmerDfrId||"Pre-registration"),checkType:"Phone and biographic screening",riskScore:risk,outcome,matches:JSON.stringify(matches.map(m=>({dfrId:m.dfrId,name:`${m.firstName} ${m.lastName}`,phone:m.phone,county:m.county})))});
  await db.insert(auditEvents).values({actor:"Duplicate detection engine",action:"Identity screened",entity:String(b.farmerDfrId||"Pre-registration"),details:`Risk ${risk}% · ${outcome}`});
  return NextResponse.json({risk,outcome,matches});
}
