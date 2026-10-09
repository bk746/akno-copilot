import "@/components/copilot/lock.css";
import { LockScreen } from "@/components/copilot/LockScreen";
import { displayFirstName } from "@/lib/passcode/api-auth";
import { getUserSecurity } from "@/lib/passcode/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveSite } from "@/lib/queries/site-context";
import { siteInitials } from "@/lib/site-utils";

export const instant = false;

export default async function LockPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const site = await resolveActiveSite();
  const row = await getUserSecurity(user.id).catch(() => null);

  return (
    <Suspense fallback={null}>
      <LockScreen
        initials={siteInitials(site.name)}
        firstName={displayFirstName(user)}
        hasPasscode={Boolean(row?.passcode_hash)}
      />
    </Suspense>
  );
}
