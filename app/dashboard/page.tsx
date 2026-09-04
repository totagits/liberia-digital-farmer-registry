import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import DashboardClient from "./dashboard-client";
import { getRegistrationAccess } from "../api/registration-access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  const access=await getRegistrationAccess();
  return <DashboardClient user={{ name:user.displayName, email:user.email }} signOut={chatGPTSignOutPath()} canRegister={access.allowed} assignedRole={access.assignment?.role||"Farmer"} />;
}
