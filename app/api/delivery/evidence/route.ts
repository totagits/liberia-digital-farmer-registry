import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../db";
import { auditEvents, deliveryEvidence, deliveryItems } from "../../../../db/schema";
import { accessAssignments } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

async function authorized(requireManage=false){
  const user=await getChatGPTUser();
  if(!user)return null;
  const db=await getDb();
  const assignment=(await db.select().from(accessAssignments).where(eq(accessAssignments.email,user.email)).limit(1))[0];
  const capabilities:string[]=assignment?JSON.parse(assignment.capabilities||"[]"):[];
  const role=assignment?.role||"Authenticated user";
  const manage=role==="Ministry administrator"||["Program officer","Monitoring and evaluation officer","System administrator"].includes(role)||capabilities.includes("delivery.manage")||capabilities.includes("governance.manage");
  return requireManage&&!manage?null:{user,db,role,manage};
}

export async function POST(req:NextRequest){
  const auth=await authorized(true);if(!auth)return NextResponse.json({error:"Your role cannot upload delivery evidence."},{status:403});
  const {env}=await import("cloudflare:workers"); const form=await req.formData(); const file=form.get("file"); const itemId=Number(form.get("itemId"));
  if(!(file instanceof File)||!itemId)return NextResponse.json({error:"Select an evidence file and delivery item."},{status:400});
  if(file.size>15*1024*1024)return NextResponse.json({error:"Maximum file size is 15 MB."},{status:400});
  const allowed=["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","image/png","image/jpeg","text/csv"];
  if(!allowed.includes(file.type))return NextResponse.json({error:"Unsupported evidence format."},{status:400});
  const key=`delivery/${itemId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`; await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});
  const db=auth.db; await db.insert(deliveryEvidence).values({itemId,fileName:file.name,objectKey:key,mimeType:file.type,size:file.size,uploadedBy:auth.user.email}); const item=(await db.select().from(deliveryItems).where(eq(deliveryItems.id,itemId)).limit(1))[0]; await db.insert(auditEvents).values({actor:auth.user.email,action:"Evidence uploaded",entity:item?.reference||String(itemId),details:file.name}); return NextResponse.json({ok:true});
}
export async function GET(req:NextRequest){
  const auth=await authorized();if(!auth)return NextResponse.json({error:"Authentication required"},{status:401});
  const {env}=await import("cloudflare:workers"); const id=Number(req.nextUrl.searchParams.get("id")); const db=auth.db; const row=(await db.select().from(deliveryEvidence).where(eq(deliveryEvidence.id,id)).limit(1))[0];
  if(!row)return NextResponse.json({error:"Evidence not found"},{status:404}); const object=await env.BUCKET.get(row.objectKey); if(!object)return NextResponse.json({error:"Evidence object not found"},{status:404});
  return new NextResponse(object.body,{headers:{"content-type":row.mimeType,"content-disposition":`inline; filename="${row.fileName.replaceAll('"','')}"`}});
}
