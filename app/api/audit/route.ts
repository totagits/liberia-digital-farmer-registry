import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { auditEvents } from "../../../db/schema";

export const dynamic = "force-dynamic";
export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(30);
  return NextResponse.json(rows);
}
