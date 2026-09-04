import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents, farmers, grievances, households, identityChecks, paymentAccounts, programmeApplications, vouchers } from "../../../db/schema";

export const dynamic="force-dynamic";
const maps={households,identity:identityChecks,applications:programmeApplications,payments:paymentAccounts,vouchers,grievances} as const;

const database = () => getDb();

export async function GET(req:NextRequest){
  const type=req.nextUrl.searchParams.get("type") as keyof typeof maps;
  if(!maps[type]) return NextResponse.json({error:"Unknown operation"},{status:400});
  const db=await database();
  return NextResponse.json(await db.select().from(maps[type] as any).orderBy(desc((maps[type] as any).createdAt)));
}

export async function POST(req:NextRequest){
  const body=await req.json(); const type=String(body.type); const db=await database(); let values:any; let entity="";
  if(type==="households"){entity=`HH-LBR-${Date.now().toString().slice(-5)}`;values={householdId:entity,farmerDfrId:body.farmerDfrId,representative:body.representative,county:body.county,members:+body.members,femaleMembers:+body.femaleMembers,youthMembers:+body.youthMembers,disabledMembers:+body.disabledMembers,dependants:+body.dependants};await db.insert(households).values(values)}
  else if(type==="applications"){entity=`APP-${Date.now().toString().slice(-6)}`;values={applicationId:entity,farmerDfrId:body.farmerDfrId,programme:body.programme,county:body.county,requestedSupport:body.requestedSupport,eligibilityScore:+body.eligibilityScore||0};await db.insert(programmeApplications).values(values)}
  else if(type==="payments"){entity=body.farmerDfrId;const raw=String(body.accountNumber);values={farmerDfrId:entity,provider:body.provider,accountName:body.accountName,accountNumberMasked:`${raw.slice(0,4)}•••${raw.slice(-3)}`};await db.insert(paymentAccounts).values(values)}
  else if(type==="vouchers"){entity=`VCH-${Date.now().toString().slice(-6)}`;values={voucherCode:entity,farmerDfrId:body.farmerDfrId,programme:body.programme,category:body.category,value:+body.value,currency:body.currency||"USD",expiresAt:body.expiresAt};await db.insert(vouchers).values(values)}
  else if(type==="grievances"){entity=`GRV-${Date.now().toString().slice(-6)}`;values={ticketId:entity,farmerDfrId:body.farmerDfrId||"Anonymous",category:body.category,channel:body.channel,county:body.county,description:body.description,priority:body.priority||"Normal"};await db.insert(grievances).values(values)}
  else return NextResponse.json({error:"Unknown operation"},{status:400});
  await db.insert(auditEvents).values({actor:"Authorized platform user",action:`${type} record created`,entity,details:"Created through governed workflow"});
  return NextResponse.json({ok:true,entity},{status:201});
}

export async function PATCH(req:NextRequest){
  const b=await req.json(); const db=await database();
  if(b.type==="applications") await db.update(programmeApplications).set({status:b.status}).where(eq(programmeApplications.id,+b.id));
  else if(b.type==="vouchers") await db.update(vouchers).set({status:b.status}).where(eq(vouchers.id,+b.id));
  else if(b.type==="grievances") await db.update(grievances).set({status:b.status}).where(eq(grievances.id,+b.id));
  else if(b.type==="payments") await db.update(paymentAccounts).set({status:b.status,verified:b.status==="Verified"}).where(eq(paymentAccounts.id,+b.id));
  else return NextResponse.json({error:"Unsupported update"},{status:400});
  await db.insert(auditEvents).values({actor:"Authorized platform user",action:`${b.type} status updated`,entity:String(b.id),details:String(b.status)});
  return NextResponse.json({ok:true});
}
