import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/copilot/AdminPanel";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    redirect("/");
  }

  return (
    <div className="admin-page">
      <AdminPanel />
    </div>
  );
}
