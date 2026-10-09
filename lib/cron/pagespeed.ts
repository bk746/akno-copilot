import { createAdminClient } from "@/lib/supabase/admin";

type Strategy = "mobile" | "desktop";

type PsiResult = {
  performance: number;
  accessibility: number;
  best_practices: number;
  seo: number;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  tbt: number | null;
  ttfb: number | null;
};

async function runPageSpeed(
  url: string,
  strategy: Strategy,
): Promise<PsiResult | null> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("key", key);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.append("category", "accessibility");
  endpoint.searchParams.append("category", "best-practices");
  endpoint.searchParams.append("category", "seo");

  const res = await fetch(endpoint.toString(), {
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    lighthouseResult?: {
      categories?: Record<string, { score?: number }>;
      audits?: Record<
        string,
        { numericValue?: number; displayValue?: string }
      >;
    };
  };

  const cats = json.lighthouseResult?.categories ?? {};
  const audits = json.lighthouseResult?.audits ?? {};
  const score = (id: string) =>
    Math.round((cats[id]?.score ?? 0) * 100);

  return {
    performance: score("performance"),
    accessibility: score("accessibility"),
    best_practices: score("best-practices"),
    seo: score("seo"),
    lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
    inp: audits["interaction-to-next-paint"]?.numericValue ?? null,
    cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    fcp: audits["first-contentful-paint"]?.numericValue ?? null,
    tbt: audits["total-blocking-time"]?.numericValue ?? null,
    ttfb: audits["server-response-time"]?.numericValue ?? null,
  };
}

export async function syncPageSpeedForSite(site: {
  id: string;
  url: string;
}): Promise<void> {
  const admin = createAdminClient();
  for (const strategy of ["mobile", "desktop"] as const) {
    const result = await runPageSpeed(site.url, strategy);
    if (!result) continue;
    await admin.from("pagespeed_runs").insert({
      site_id: site.id,
      strategy,
      ...result,
    });
  }
}

export async function syncPageSpeedAllSites(): Promise<number> {
  const admin = createAdminClient();
  const { data: sites } = await admin.from("sites").select("id, url");
  if (!sites?.length) return 0;
  for (const site of sites) {
    await syncPageSpeedForSite(site);
  }
  return sites.length;
}
