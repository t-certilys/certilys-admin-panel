import { redirect } from "next/navigation";
import { getAdminSessionAction } from "@/lib/auth-actions";

export default async function Home() {
  const session = await getAdminSessionAction();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
