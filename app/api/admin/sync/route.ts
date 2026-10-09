import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { syncGscForSite } from "@/lib/cron/gsc";
import { syncHealthForSite } from "@/lib/cron/health";
import { syncPageSpeedForSite } from "@/lib/cron/pagespeed";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { siteId } = (await req.json()) as { siteId?: string };
  if (!siteId) {
    return NextResponse.json({ error: "siteId requis" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: site, error } = await admin
    .from("sites")
    .select("id, url, domain, gsc_property")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !site) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  await syncPageSpeedForSite(site);
  await syncGscForSite(site);
  await syncHealthForSite(site);

  return NextResponse.json({ ok: true });
}
