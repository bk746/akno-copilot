import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SiteRow = {
  id: string;
  public_id: string;
  name: string;
  domain: string;
  url: string;
  gsc_property: string | null;
};

const SITE_COOKIE = "akno_site_id";

export async function getUserSites(): Promise<SiteRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("site_members")
    .select("site_id, sites(id, public_id, name, domain, url, gsc_property)")
    .eq("user_id", user.id);

  if (!memberships?.length) return [];

  return memberships
    .map((m) => m.sites as unknown as SiteRow)
    .filter(Boolean);
}

export async function resolveActiveSite(preferredId?: string): Promise<SiteRow> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const targetId = preferredId ?? cookieStore.get(SITE_COOKIE)?.value;

  if (user && isAdminEmail(user.email) && targetId) {
    try {
      const admin = createAdminClient();
      const { data: site } = await admin
        .from("sites")
        .select("id, public_id, name, domain, url, gsc_property")
        .eq("id", targetId)
        .maybeSingle();
      if (site) return site;
    } catch {
      /* env dev */
    }
  }

  const sites = await getUserSites();
  if (!sites.length) {
    redirect("/login?error=no_site");
  }

  const found = sites.find((s) => s.id === targetId) ?? sites[0];
  return found;
}
