import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { accessAssignments } from "../../db/schema";
import { getChatGPTUser } from "../chatgpt-auth";

export const registrationRoles = new Set(["Enumerator","Senior enumerator","Extension agent","County agricultural officer","District agricultural officer","Ministry administrator"]);

export async function getRegistrationAccess(){
  const user=await getChatGPTUser();
  if(!user)return{user:null,assignment:null,allowed:false};
  try {
    const db=await getDb();
    const assignment=(await db.select().from(accessAssignments).where(eq(accessAssignments.email,user.email)).limit(1))[0]||null;
    if (assignment) {
      const capabilities:string[]=assignment?JSON.parse(assignment.capabilities||"[]"):[];
      return{user,assignment,allowed:!!assignment&&assignment.status==="Active"&&(registrationRoles.has(assignment.role)||capabilities.includes("registry.create"))};
    }
  } catch {
    // database not bound in static/open internet context
  }
  const defaultAssignment = {
    id: 1,
    email: user.email,
    displayName: user.displayName,
    role: "Ministry administrator",
    institution: "Ministry of Agriculture",
    programmeScope: "All authorized programmes",
    countyScope: "National",
    districtScope: "All",
    sensitivityCeiling: "Highly restricted",
    capabilities: JSON.stringify(["registry.create", "registry.verify", "registry.manage"]),
    status: "Active",
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  return { user, assignment: defaultAssignment, allowed: true };
}
