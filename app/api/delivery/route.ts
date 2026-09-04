import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { accessAssignments, auditEvents, deliveryEvidence, deliveryItems } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { realtimeBus } from "../../../lib/realtime-bus";

export const dynamic = "force-dynamic";

const templates = [
  {number:"D1",component:1,workstream:"Inception & planning",title:"Inception report, detailed methodology and seven-month work plan",description:"Confirmed scope, stakeholder engagement plan, delivery governance, quality plan, risks, assumptions and implementation schedule.",owner:"TOTAG Project Manager",institution:"TOTAG / MoA",reviewer:"FAO Liberia",approver:"FAO Contract Manager",dueDate:"Contract T+2 weeks",dependencies:"Contract signature; kick-off meeting",acceptanceCriteria:"Approved methodology, mobilization plan, RACI, risk register and detailed seven-month schedule."},
  {number:"D2",component:1,workstream:"Assessment & gap analysis",title:"Comprehensive gap-assessment report",description:"Assessment of existing farmer registries, agricultural MIS, social-protection systems, data, infrastructure, institutional readiness and interoperability gaps.",owner:"Assessment Lead",institution:"TOTAG / MoA / MGCSP / LISGIS / CDA",reviewer:"FAO Technical Team",approver:"FAO Contract Manager",dueDate:"Contract T+6 weeks",dependencies:"D1 accepted; stakeholder access",acceptanceCriteria:"Validated inventory, consultation evidence, findings, prioritized gaps and actionable recommendations."},
  {number:"D3",component:2,workstream:"Solution design",title:"Digital Farmer Registry system-design document",description:"Business, data, application, GIS, integration, infrastructure, security, privacy, governance and deployment architecture.",owner:"Solution Architect",institution:"TOTAG / MoA ICT / LISGIS",reviewer:"FAO Technical Team",approver:"MoA and FAO",dueDate:"Contract T+10 weeks",dependencies:"D2 findings; governance decisions",acceptanceCriteria:"Approved target architecture, data model, interface specifications, security controls and infrastructure design."},
  {number:"D4",component:3,workstream:"SOPs & institutional operations",title:"Complete DFR and MIS Standard Operating Procedures manual",description:"Operational procedures for registration, validation, GIS, quality, security, interoperability, social protection, reporting, governance, training and change control.",owner:"Operations & Governance Lead",institution:"MoA / MGCSP / LISGIS / CDA / Local Authorities",reviewer:"Technical Working Group",approver:"National Steering Committee / MoA",dueDate:"Contract T+16 weeks",dependencies:"D3 approved; stakeholder consultations",acceptanceCriteria:"Consulted, comment-resolved, institutionally validated, version-controlled and formally approved SOP manual."},
  {number:"D5",component:4,workstream:"Platform implementation",title:"Functional and interoperable Digital Farmer Registry platform",description:"Configured national DFR/MIS with offline registration, GIS, RBAC, audit, programmes, social-protection referrals, APIs, dashboards and security controls.",owner:"Technical Delivery Lead",institution:"TOTAG / MoA ICT",reviewer:"FAO and Government UAT Team",approver:"MoA and FAO",dueDate:"Contract T+22 weeks",dependencies:"D3 approved; infrastructure and API access",acceptanceCriteria:"All approved requirements pass functional, security, GIS, offline, performance and interoperability acceptance tests."},
  {number:"D6",component:5,workstream:"Capacity development",title:"Training materials, competency results and training reports",description:"Role-based curricula, facilitator guides, user manuals, attendance, assessments, certifications, coaching and knowledge-transfer evidence.",owner:"Capacity Development Lead",institution:"TOTAG / MoA / County Teams",reviewer:"FAO Capacity Focal Point",approver:"MoA and FAO",dueDate:"Contract T+25 weeks",dependencies:"D5 release candidate; trainee nomination",acceptanceCriteria:"Approved materials, completed sessions, attendance evidence, competency results and support transition plan."},
  {number:"D7",component:6,workstream:"Pilot, UAT & rollout",title:"Pilot implementation and national-rollout readiness report",description:"Pilot execution, UAT approvals, defects and resolutions, operational readiness, county rollout tracking and production commissioning evidence.",owner:"QA & Rollout Lead",institution:"TOTAG / MoA / Pilot Counties",reviewer:"UAT Committee",approver:"MoA and FAO",dueDate:"Contract T+28 weeks",dependencies:"D5 and D6; pilot authorization",acceptanceCriteria:"Signed UAT, resolved critical defects, pilot evidence, readiness decision and approved national rollout plan."},
  {number:"D8",component:7,workstream:"Learning & closure",title:"Final report, lessons learned and policy recommendations",description:"Consolidated delivery results, sustainability and handover, lessons, best practices, policy recommendations, outstanding actions and closure evidence.",owner:"Project Manager / M&E Lead",institution:"TOTAG / MoA / FAO",reviewer:"FAO Technical Team",approver:"FAO Contract Manager",dueDate:"Contract T+7 months",dependencies:"D1–D7 accepted",acceptanceCriteria:"Complete results narrative, evidence index, lessons, sustainability plan, recommendations and formal handover."},
] as const;

async function context(){
  const user=await getChatGPTUser();
  if(!user)return null;
  const db=await getDb();
  const assignment=(await db.select().from(accessAssignments).where(eq(accessAssignments.email,user.email)).limit(1))[0];
  const capabilities:string[]=assignment?JSON.parse(assignment.capabilities||"[]"):[];
  const role=assignment?.role||"Authenticated user";
  const manage=role==="Ministry administrator"||["Program officer","Monitoring and evaluation officer","System administrator"].includes(role)||capabilities.includes("delivery.manage")||capabilities.includes("governance.manage");
  const review=manage||["Development-partner user","Read-only oversight user"].includes(role)||capabilities.includes("delivery.review");
  const accept=role==="Ministry administrator"||role==="Development-partner user"||capabilities.includes("delivery.accept");
  return{db,user,assignment,role,manage,review,accept};
}
const parse=(value:string,fallback:Record<string,unknown>={})=>{try{return JSON.parse(value||"{}") as Record<string,unknown>}catch{return fallback}};
const historyEntry=(actor:string,role:string,action:string,notes="")=>({at:new Date().toISOString(),actor,role,action,notes});

export async function GET(req:NextRequest){
  const c=await context();if(!c)return NextResponse.json({error:"Authentication required"},{status:401});
  const component=Number(req.nextUrl.searchParams.get("component")||0);
  const rows=component?await c.db.select().from(deliveryItems).where(eq(deliveryItems.component,component)).orderBy(desc(deliveryItems.updatedAt)):await c.db.select().from(deliveryItems).orderBy(deliveryItems.component,deliveryItems.dueDate);
  const [evidence,audits]=await Promise.all([c.db.select().from(deliveryEvidence).orderBy(desc(deliveryEvidence.createdAt)),c.db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt))]);
  return NextResponse.json({
    access:{role:c.role,manage:c.manage,review:c.review,accept:c.accept,institution:c.assignment?.institution||""},
    templates,
    items:rows.map(row=>({...row,metadata:parse(row.metadata),evidence:evidence.filter(e=>e.itemId===row.id),audit:audits.filter(a=>a.entity===row.reference)})),
  });
}

export async function POST(req:NextRequest){
  const c=await context();if(!c)return NextResponse.json({error:"Authentication required"},{status:401});
  if(!c.manage)return NextResponse.json({error:"Your role cannot create FAO delivery records."},{status:403});
  const body=await req.json();
  if(body.action==="initialize-rfp"){
    const existing=await c.db.select().from(deliveryItems);
    const existingNumbers=new Set(existing.map(x=>String(parse(x.metadata).deliverableNumber||"")));
    let created=0;
    for(const t of templates){
      if(existingNumbers.has(t.number))continue;
      const reference=`FAO-${t.number}-${Date.now().toString().slice(-6)}-${created+1}`;
      const metadata={deliverableNumber:t.number,institution:t.institution,reviewer:t.reviewer,approver:t.approver,dependencies:t.dependencies,risks:"To be assessed",priority:"High",progress:0,version:"0.1",acceptanceCriteria:t.acceptanceCriteria,history:[historyEntry(c.user.email,c.role,"RFP deliverable initialized","Created from the approved assignment structure")]};
      await c.db.insert(deliveryItems).values({reference,component:t.component,workstream:t.workstream,title:t.title,description:t.description,owner:t.owner,county:"National",dueDate:t.dueDate,status:"Planned",metadata:JSON.stringify(metadata)});
      await c.db.insert(auditEvents).values({actor:c.user.email,action:"FAO deliverable initialized",entity:reference,details:`${t.number}: ${t.title}`});created++;
    }
    realtimeBus.publish("delivery:updated", { action: "initialize-rfp", created });
    return NextResponse.json({ok:true,created});
  }
  const reference=`FAO-C${body.component}-${Date.now().toString().slice(-6)}`;
  const metadata={deliverableNumber:body.deliverableNumber||"Supporting record",institution:body.institution||"MoA / TOTAG",reviewer:body.reviewer||"FAO Technical Team",approver:body.approver||"FAO Contract Manager",startDate:body.startDate||"",dependencies:body.dependencies||"",risks:body.risks||"",priority:body.priority||"Normal",progress:+body.progress||0,version:body.version||"0.1",acceptanceCriteria:body.acceptanceCriteria||"",history:[historyEntry(c.user.email,c.role,"Delivery record created",body.description||"")]};
  await c.db.insert(deliveryItems).values({reference,component:+body.component,workstream:body.workstream,title:body.title,description:body.description||"",owner:body.owner,county:body.county||"National",dueDate:body.dueDate,status:body.status||"Planned",metadata:JSON.stringify(metadata)});
  await c.db.insert(auditEvents).values({actor:c.user.email,action:"Delivery record created",entity:reference,details:body.title});
  realtimeBus.publish("delivery:updated", { action: "create", reference });
  return NextResponse.json({ok:true,reference},{status:201});
}

export async function PATCH(req:NextRequest){
  const c=await context();if(!c)return NextResponse.json({error:"Authentication required"},{status:401});
  const body=await req.json();const id=+body.id;
  const row=(await c.db.select().from(deliveryItems).where(eq(deliveryItems.id,id)).limit(1))[0];
  if(!row)return NextResponse.json({error:"Delivery record not found"},{status:404});
  const decision=String(body.acceptanceStatus||"");
  if(decision==="Under review"&&!c.manage)return NextResponse.json({error:"Only a delivery manager can submit for review."},{status:403});
  if(["Changes requested","Resubmitted"].includes(decision)&&!c.review)return NextResponse.json({error:"Your role cannot record this review decision."},{status:403});
  if(decision==="Accepted"&&!c.accept)return NextResponse.json({error:"Your role cannot formally accept a deliverable."},{status:403});
  if(!decision&&!c.manage)return NextResponse.json({error:"Your role cannot update implementation controls."},{status:403});
  if(decision==="Under review"&&!(await c.db.select().from(deliveryEvidence).where(eq(deliveryEvidence.itemId,id)).limit(1)).length)return NextResponse.json({error:"Upload at least one evidence file before submitting for review."},{status:400});
  const metadata={...parse(row.metadata),...(body.metadata||{})} as Record<string,unknown>;
  const history=Array.isArray(metadata.history)?metadata.history as unknown[]:[];
  const action=decision?`Workflow moved to ${decision}`:"Implementation record updated";
  metadata.history=[historyEntry(c.user.email,c.role,action,String(body.notes||body.decisionNotes||"")),...history];
  if(body.progress!==undefined)metadata.progress=Math.max(0,Math.min(100,+body.progress));
  if(body.version)metadata.version=body.version;
  if(body.dependencies!==undefined)metadata.dependencies=body.dependencies;
  if(body.risks!==undefined)metadata.risks=body.risks;
  if(body.priority)metadata.priority=body.priority;
  if(body.decisionNotes!==undefined)metadata.decisionNotes=body.decisionNotes;
  if(decision==="Under review")metadata.submittedAt=new Date().toISOString();
  if(decision==="Accepted"){metadata.acceptedAt=new Date().toISOString();metadata.acceptedBy=c.user.email;metadata.progress=100}
  const patch:Record<string,unknown>={metadata:JSON.stringify(metadata),updatedAt:sql`CURRENT_TIMESTAMP`};
  if(body.status)patch.status=body.status;if(decision)patch.acceptanceStatus=decision;if(body.owner)patch.owner=body.owner;if(body.dueDate)patch.dueDate=body.dueDate;
  await c.db.update(deliveryItems).set(patch).where(eq(deliveryItems.id,id));
  await c.db.insert(auditEvents).values({actor:c.user.email,action,entity:row.reference,details:JSON.stringify({from:row.acceptanceStatus,to:decision||row.acceptanceStatus,notes:body.notes||body.decisionNotes||""})});
  realtimeBus.publish("delivery:updated", { action: "update", id, decision, reference: row.reference });
  return NextResponse.json({ok:true});
}
