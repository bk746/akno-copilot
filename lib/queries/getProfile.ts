import { createClient } from "@/lib/supabase/server";
import { getLiveHealthCached } from "@/lib/cron/health";
import type { SiteRow } from "./site-context";

export type ProfileData = {
  site: SiteRow;
  url: string;
  httpsOk: boolean;
  sslIssuer: string | null;
  sslValidTo: string | null;
  domainExpiresAt: string | null;
  trackingInstalled: boolean;
  searchConsoleConnected: boolean;
  pageSpeedReady: boolean;
  userEmail: string | null;
};

export async function getProfile(site: SiteRow): Promise<ProfileData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const since48h = new Date(Date.now() - 48 * 3600_000).toISOString();

  const [{ count: events48h }, { count: gscCount }, { count: psiCount }, { data: healthDb }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id)
        .gte("created_at", since48h),
      supabase
        .from("gsc_daily")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id)
        .gte(
          "date",
          new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
        ),
      supabase
        .from("pagespeed_runs")
        .select("id", { count: "exact", head: true })
        .eq("site_id", site.id),
      supabase
        .from("site_health")
        .select("ssl_issuer, ssl_valid_to, domain_expires_at, is_up")
        .eq("site_id", site.id)
        .order("checked_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  let live: {
    ssl_issuer?: string | null;
    ssl_valid_to?: string | null;
    domain_expires_at?: string | null;
    is_up?: boolean;
  } | null = healthDb;

  try {
    live = await getLiveHealthCached(site);
  } catch {
    /* ignore */
  }

  return {
    site,
    url: site.url,
    httpsOk: site.url.startsWith("https://") && Boolean(live?.is_up ?? true),
    sslIssuer: live?.ssl_issuer ?? null,
    sslValidTo: live?.ssl_valid_to ?? null,
    domainExpiresAt: live?.domain_expires_at ?? null,
    trackingInstalled: (events48h ?? 0) > 0,
    searchConsoleConnected: (gscCount ?? 0) > 0,
    pageSpeedReady: (psiCount ?? 0) > 0,
    userEmail: user?.email ?? null,
  };
}
