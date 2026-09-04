import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { accessAssignments, agricultureProgrammes, auditEvents, programmeCaseEvents, programmeCases } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";
const managerRoles = new Set(["Program officer", "Ministry administrator"]);

async function context(){
  const user=await getChatGPTUser(); if(!user) return null;
  const db=await getDb();
  const assignment=(await db.select().from(accessAssignments).where(eq(accessAssignments.email,user.email)).limit(1))[0]||null;
  const capabilities:string[]=assignment?JSON.parse(assignment.capabilities||"[]"):[];
  const role=assignment?.role||"Farmer";
  return {db,user,assignment,role,canManage:assignment?.status==="Active"&&(managerRoles.has(role)||capabilities.includes("programme.manage"))};
}

export async function GET(){
  const c=await context(); if(!c) return NextResponse.json({error:"Authentication required"},{status:401});
  const programmes=await c.db.select().from(agricultureProgrammes).orderBy(desc(agricultureProgrammes.createdAt));
  const applications=c.canManage?await c.db.select().from(programmeCases).orderBy(desc(programmeCases.submittedAt)):await c.db.select().from(programmeCases).where(eq(programmeCases.applicantEmail,c.user.email)).orderBy(desc(programmeCases.submittedAt));
  return NextResponse.json({programmes,applications,access:{role:c.role,canManage:c.canManage,scope:c.assignment?.countyScope||"Self",currentEmail:c.user.email}});
}

export async function POST(req:NextRequest){
  const c=await context(); if(!c) return NextResponse.json({error:"Authentication required"},{status:401});
  const body=await req.json();
  if(body.action==="apply"){
    const programme=(await c.db.select().from(agricultureProgrammes).where(and(eq(agricultureProgrammes.programmeCode,String(body.programmeCode)),eq(agricultureProgrammes.status,"Open"))).limit(1))[0];
    if(!programme) return NextResponse.json({error:"Programme is not open"},{status:400});
    if(!body.applicantRef||!body.county||!body.district||!body.requestedSupport||!body.justification) return NextResponse.json({error:"Complete all required fields"},{status:400});
    const code=`APP-${Date.now().toString(36).toUpperCase()}`;
    await c.db.insert(programmeCases).values({applicationCode:code,programmeCode:programme.programmeCode,programmeTitle:programme.title,applicantEmail:c.user.email,applicantName:c.user.displayName,applicantRole:c.role,applicantRef:String(body.applicantRef),county:String(body.county),district:String(body.district),requestedSupport:String(body.requestedSupport),justification:String(body.justification)});
    await c.db.insert(programmeCaseEvents).values({applicationCode:code,actorEmail:c.user.email,actorName:c.user.displayName,actorRole:c.role,action:"APPLICATION_SUBMITTED",comments:"Submitted by authenticated applicant"});
    await c.db.insert(auditEvents).values({actor:c.user.email,action:"Programme application submitted",entity:code,details:programme.programmeCode});
    return NextResponse.json({ok:true,code},{status:201});
  }
  if(body.action==="programme"){
    if(!c.canManage) return NextResponse.json({error:"Programme management permission required"},{status:403});
    const code=`PRG-${Date.now().toString(36).toUpperCase()}`;
    await c.db.insert(agricultureProgrammes).values({programmeCode:code,title:String(body.title),description:String(body.description),ownerInstitution:String(body.ownerInstitution||c.assignment?.institution||"MoA"),assistanceType:String(body.assistanceType),targetGroups:String(body.targetGroups),counties:String(body.counties),eligibilityCriteria:String(body.eligibilityCriteria),openingDate:String(body.openingDate),deadline:String(body.deadline),status:"Draft"});
    return NextResponse.json({ok:true,code},{status:201});
  }
  return NextResponse.json({error:"Unsupported action"},{status:400});
}

export async function PATCH(req:NextRequest){
  const c=await context(); if(!c) return NextResponse.json({error:"Authentication required"},{status:401});
  const body=await req.json();
  if(body.action==="withdraw"){
    const record=(await c.db.select().from(programmeCases).where(and(eq(programmeCases.applicationCode,String(body.applicationCode)),eq(programmeCases.applicantEmail,c.user.email))).limit(1))[0];
    if(!record||!["Submitted","Correction requested"].includes(record.status)) return NextResponse.json({error:"Application cannot be withdrawn"},{status:403});
    await c.db.update(programmeCases).set({status:"Withdrawn",updatedAt:new Date().toISOString()}).where(eq(programmeCases.applicationCode,record.applicationCode));
  }else if(body.action==="decision"){
    if(!c.canManage) return NextResponse.json({error:"Programme management permission required"},{status:403});
    const allowed=["Under review","Correction requested","Eligible","Approved","Waitlisted","Rejected"];
    if(!allowed.includes(body.status)) return NextResponse.json({error:"Invalid status"},{status:400});
    await c.db.update(programmeCases).set({status:body.status,eligibilityScore:Math.max(0,Math.min(100,Number(body.eligibilityScore)||0)),reviewer:c.user.displayName,decisionReason:String(body.decisionReason||""),updatedAt:new Date().toISOString()}).where(eq(programmeCases.applicationCode,String(body.applicationCode)));
  }else return NextResponse.json({error:"Unsupported action"},{status:400});
  await c.db.insert(programmeCaseEvents).values({applicationCode:String(body.applicationCode),actorEmail:c.user.email,actorName:c.user.displayName,actorRole:c.role,action:String(body.action).toUpperCase(),comments:String(body.decisionReason||"")});
  await c.db.insert(auditEvents).values({actor:c.user.email,action:`Programme application ${body.action}`,entity:String(body.applicationCode),details:String(body.status||"")});
  return NextResponse.json({ok:true});
}
