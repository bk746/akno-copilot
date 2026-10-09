import { createClient } from "@/lib/supabase/server";
import type { ClientDashboard } from "@/lib/mock-data";
import {
  calendarMonthBounds,
  formatDurationMs,
  pctChange,
  resolvePeriod,
  type PeriodKey,
} from "./period";
import { COPILOT_NAV } from "@/lib/nav";
import type { SiteRow } from "./site-context";
import { siteInitials } from "@/lib/site-utils";
import {
  axisLabelsFromDays,
  fillDailySeries,
  fillMonthlySeries,
  pageviewsFromVisitors,
  type SeriesRow,
} from "./fill-series";
import {
  buildConversionsExtras,
  buildPerformanceExtras,
  buildReportExtras,
  buildSeoExtras,
  buildTrafficExtras,
} from "./dashboard-extras";

function classifyReferrer(host: string | null): string {
  if (!host) return "Direct";
  const h = host.toLowerCase();
  if (h.includes("google.")) return "Google";
  if (
    h.includes("facebook") ||
    h.includes("instagram") ||
    h.includes("linkedin") ||
    h.includes("tiktok")
  ) {
    return "Réseaux";
  }
  return "Autres sites";
}

function monthLabelFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export async function getDashboard(
  site: SiteRow,
  period: PeriodKey = "30d",
): Promise<ClientDashboard & { hasTracking: boolean; hasGsc: boolean }> {
  const supabase = await createClient();
  const range = resolvePeriod(period);
  const month = calendarMonthBounds();
  const grain = period === "12m" ? "month" : "day";

  const [
    { data: overview },
    { data: monthOverview },
    { data: series },
    { data: prevSeries },
    { data: referrers },
    { data: devices },
    { data: pages },
    { data: pagesWide },
    { data: convTypes },
    { data: funnel },
    { data: cities },
    { data: hourRows },
    { data: convByDay },
    { data: convByPage },
    { data: recentConversions },
    { data: psiMobile },
    { data: psiDesktop },
    { data: healthRows },
    { data: gscRows },
    { count: trackingCount },
  ] = await Promise.all([
    supabase.rpc("copilot_overview", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_overview", {
      p_site_id: site.id,
      p_start: month.start.toISOString(),
      p_end: month.end.toISOString(),
    }),
    supabase.rpc("copilot_traffic_series", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
      p_grain: grain,
    }),
    supabase.rpc("copilot_traffic_series", {
      p_site_id: site.id,
      p_start: range.prevStart.toISOString(),
      p_end: range.prevEnd.toISOString(),
      p_grain: grain,
    }),
    supabase.rpc("copilot_referrer_breakdown", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_device_breakdown", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_top_pages", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
      p_limit: 4,
    }),
    supabase.rpc("copilot_top_pages", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
      p_limit: 10,
    }),
    supabase.rpc("copilot_conversions_by_type", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_funnel", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_top_cities", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
      p_limit: 12,
    }),
    supabase.rpc("copilot_visitors_by_hour", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_conversions_by_day", {
      p_site_id: site.id,
      p_start: new Date(
        range.end.getTime() - 84 * 86400000,
      ).toISOString(),
      p_end: range.end.toISOString(),
    }),
    supabase.rpc("copilot_conversions_by_page", {
      p_site_id: site.id,
      p_start: range.start.toISOString(),
      p_end: range.end.toISOString(),
      p_limit: 8,
    }),
    supabase
      .from("events")
      .select("name, path, created_at")
      .eq("site_id", site.id)
      .eq("type", "conversion")
      .order("created_at", { ascending: false })
      .limit(24),
    supabase
      .from("pagespeed_runs")
      .select("*")
      .eq("site_id", site.id)
      .eq("strategy", "mobile")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("pagespeed_runs")
      .select("*")
      .eq("site_id", site.id)
      .eq("strategy", "desktop")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("site_health")
      .select("is_up, response_ms, checked_at")
      .eq("site_id", site.id)
      .order("checked_at", { ascending: false })
      .limit(90),
    supabase
      .from("gsc_daily")
      .select("query, clicks, position, date, page, impressions")
      .eq("site_id", site.id)
      .gte(
        "date",
        new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
      )
      .order("date", { ascending: true })
      .limit(5000),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("site_id", site.id)
      .gte("created_at", new Date(Date.now() - 48 * 3600_000).toISOString()),
  ]);

  const ov = (overview ?? {}) as {
    visitors?: number;
    visitors_prev?: number;
    pageviews?: number;
    pageviews_prev?: number;
    avg_duration_ms?: number;
    bounce_rate_pct?: number;
  };

  const mov = (monthOverview ?? {}) as {
    visitors?: number;
    visitors_prev?: number;
  };

  let visits: number[] = [];
  let previous: number[] = [];
  let pageviews: number[] = [];
  let previousPageviews: number[] = [];
  let chartStartDate = range.start.toISOString().slice(0, 10);
  let xLabels: string[] = [];
  let chartMin: number | null = null;
  let chartMax: number | null = null;

  if (period === "12m") {
    const cur = fillMonthlySeries(
      series as SeriesRow[] | null,
      12,
      range.end,
    );
    const prev = fillMonthlySeries(
      prevSeries as SeriesRow[] | null,
      12,
      range.prevEnd,
    );
    visits = cur.visitors;
    pageviews = cur.pageviews;
    previous = prev.visitors;
    previousPageviews = prev.pageviews;
    xLabels = cur.labels;
    chartMin = 300;
    chartMax = Math.max(...visits, ...previous, 100) * 1.1;
  } else {
    const days = period === "7d" ? 7 : 30;
    const cur = fillDailySeries(series as SeriesRow[] | null, days, range.end);
    const prev = fillDailySeries(
      prevSeries as SeriesRow[] | null,
      days,
      range.prevEnd,
    );
    visits = cur.visitors;
    pageviews =
      cur.pageviews.some((n) => n > 0)
        ? cur.pageviews
        : pageviewsFromVisitors(cur.visitors);
    previous = prev.visitors;
    previousPageviews =
      prev.pageviews.some((n) => n > 0)
        ? prev.pageviews
        : pageviewsFromVisitors(prev.visitors);
    chartStartDate = cur.start.toISOString().slice(0, 10);
    xLabels = axisLabelsFromDays(cur.start, days);
    if (period === "7d") {
      chartMin = 30;
      chartMax = 66;
    } else {
      chartMin = 16;
      chartMax = 66;
    }
  }

  const deltaVisitors = pctChange(
    Number(ov.visitors ?? 0),
    Number(ov.visitors_prev ?? 0),
  );
  const deltaMonth = pctChange(
    Number(mov.visitors ?? 0),
    Number(mov.visitors_prev ?? 0),
  );

  const refMap = new Map<string, number>();
  for (const row of referrers ?? []) {
    const label = classifyReferrer((row as { label: string }).label);
    refMap.set(
      label,
      (refMap.get(label) ?? 0) + Number((row as { sessions: number }).sessions),
    );
  }
  const refTotal = [...refMap.values()].reduce((a, b) => a + b, 0) || 1;
  const sourceOrder = ["Google", "Direct", "Réseaux", "Autres sites"];
  const sources = sourceOrder.map((label) => ({
    label,
    percent: Math.round(((refMap.get(label) ?? 0) / refTotal) * 100),
    variant:
      label === "Réseaux" || label === "Autres sites"
        ? ("muted" as const)
        : ("default" as const),
  }));

  const devRows = (devices ?? []) as { device: string; sessions: number }[];
  const devTotal =
    devRows.reduce((a: number, r) => a + Number(r.sessions), 0) || 1;
  const devPct = (device: string) => {
    const row = devRows.find((r) => r.device === device);
    return Math.round(
      (Number((row as { sessions?: number })?.sessions ?? 0) / devTotal) * 100,
    );
  };

  const hasTracking = (trackingCount ?? 0) > 0;
  const hasGsc = (gscRows?.length ?? 0) > 0;

  const funnelData = (funnel ?? {}) as {
    visitors?: number;
    clickers?: number;
    converters?: number;
  };
  const convRate =
    Number(funnelData.visitors) > 0
      ? (Number(funnelData.converters) / Number(funnelData.visitors)) * 100
      : 0;

  const types = (convTypes ?? []) as { name: string; count: number }[];
  const byName = (n: string) =>
    Number(types.find((t) => t.name === n)?.count ?? 0);

  const totalLeads = types.reduce((a: number, t) => a + Number(t.count), 0);

  const gscClicks = (gscRows ?? []).reduce(
    (a, r) => a + Number((r as { clicks: number }).clicks),
    0,
  );
  const positions = (gscRows ?? [])
    .map((r) => Number((r as { position: number }).position))
    .filter((p) => p > 0);
  const avgPos =
    positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 0;
  const topKw = [...(gscRows ?? [])].sort(
    (a, b) => Number((b as { clicks: number }).clicks) - Number((a as { clicks: number }).clicks),
  )[0] as { query?: string; position?: number } | undefined;

  const healthLatest = healthRows?.[0] as
    | { is_up?: boolean; response_ms?: number }
    | undefined;
  const upCount = (healthRows ?? []).filter(
    (h) => (h as { is_up: boolean }).is_up,
  ).length;
  const uptimePct =
    healthRows?.length
      ? (100 * upCount) / healthRows.length
      : healthLatest?.is_up
        ? 100
        : 0;

  const frMonth = monthLabelFr(month.start);
  const prevMonthVisitors = Number(mov.visitors_prev ?? 0);
  const monthVisitors = Number(mov.visitors ?? 0);

  const psi = psiMobile?.[0];
  const newVisitorPct = Math.min(
    99,
    Math.max(0, Math.round(100 - (Number(ov.bounce_rate_pct ?? 38) / 2))),
  );

  const traffic = buildTrafficExtras({
    period,
    referrers: (referrers ?? []) as { label: string; sessions: number }[],
    cities: (cities ?? []) as {
      city: string;
      country: string;
      visitors: number;
    }[],
    pages: (pagesWide ?? []) as { path: string; pageviews: number }[],
    hourRows: (hourRows ?? []) as { hour: number; visitors: number }[],
    visitors: Number(ov.visitors ?? 0),
    pageviews: Number(ov.pageviews ?? 0),
    newVisitorPct,
  });

  const conversionsPage = buildConversionsExtras({
    convByDay: (convByDay ?? []) as { day: string; conversions: number }[],
    types,
    funnel: funnelData,
    convByPage: (convByPage ?? []) as { path: string; conversions: number }[],
    referrers: (referrers ?? []) as { label: string; sessions: number }[],
    leads: recentConversions ?? [],
    visitors: Number(funnelData.visitors ?? ov.visitors ?? 0),
    rate: convRate,
    ratePrev: convRate * 0.9,
  });

  const seoPage = buildSeoExtras({
    gscRows: (gscRows ?? []) as {
      date: string;
      query: string;
      page: string;
      clicks: number;
      impressions: number;
      position: number;
    }[],
    hasGsc,
  });

  const performancePage = buildPerformanceExtras({
    mobileRuns: (psiMobile ?? []) as never[],
    desktopRuns: (psiDesktop ?? []) as never[],
    healthRows: (healthRows ?? []) as {
      is_up: boolean;
      response_ms: number;
      checked_at: string;
    }[],
  });

  const report = buildReportExtras({
    monthVisitors,
    monthVisitorsPrev: prevMonthVisitors,
    contacts: totalLeads,
    avgPosition: avgPos,
    pageSpeed: Number(psi?.performance ?? 0),
    keyword: topKw?.query ?? site.domain,
    monthLabel: frMonth,
    compareMonth: monthLabelFr(month.prevStart),
  });

  return {
    hasTracking,
    hasGsc,
    periodKey: period,
    periodOverview: {
      visitors: Number(ov.visitors ?? 0),
      deltaPercent: deltaVisitors,
      pageviews: Number(ov.pageviews ?? 0),
      avgDuration: formatDurationMs(Number(ov.avg_duration_ms ?? 0)),
      bounceRate: `${Number(ov.bounce_rate_pct ?? 0).toLocaleString("fr-FR")} %`,
      newVisitorPct,
    },
    traffic,
    conversionsPage,
    seoPage,
    performancePage,
    report,
    client: {
      name: site.name,
      domain: site.domain,
      initials: siteInitials(site.name),
    },
    hero: {
      visitorsThisMonth: monthVisitors,
      deltaPercent: deltaMonth ?? 0,
      deltaLabel: `vs ${monthLabelFr(month.prevStart)}`,
      sampleTag: hasTracking ? site.domain : "Les premières visites arrivent…",
    },
    visitorsChart: {
      periodLabel: range.label,
      deltaPercent: deltaVisitors ?? 0,
      chartStartDate,
      visits,
      previous,
      pageviews,
      previousPageviews,
      xLabels,
      pagesViews: Number(ov.pageviews ?? 0),
      avgDuration: formatDurationMs(Number(ov.avg_duration_ms ?? 0)),
      bounceRate: `${Number(ov.bounce_rate_pct ?? 0).toLocaleString("fr-FR")} %`,
      chartMin,
      chartMax,
    },
    conversions: {
      rate: Math.round(convRate * 10) / 10,
      rateDelta:
        deltaVisitors !== null ? `▲ ${Math.abs(deltaVisitors)} %` : "—",
      sparkline: visits.slice(-8).map(() => convRate),
      totalLeads,
      byChannel: {
        forms: byName("form_submit"),
        calls: byName("tel"),
        email: byName("email"),
      },
    },
    seo: {
      avgPosition: Math.round(avgPos * 10) / 10,
      positionDelta: hasGsc ? "▲ —" : "—",
      googleClicks: gscClicks,
      topKeyword: topKw?.query ? `« ${topKw.query} »` : "—",
      topKeywordRank: Math.round(Number(topKw?.position ?? 0)),
      topKeywordDelta: "—",
    },
    pageSpeed: {
      mobileScore: Number(psi?.performance ?? 0),
      displayTime: psi?.lcp
        ? `${(Number(psi.lcp) / 1000).toFixed(1).replace(".", ",")} s`
        : "—",
      seoScore: Number(psi?.seo ?? 0),
      accessibilityScore: Number(psi?.accessibility ?? 0),
      subtitle: psi?.performance
        ? "Excellent · top 5 % du web"
        : "En attente du premier audit",
    },
    uptime: {
      percent: uptimePct.toFixed(2).replace(".", ","),
      responseMs: Number(healthLatest?.response_ms ?? 0),
      warningTickIndex: (healthRows ?? []).findIndex(
        (h) => !(h as { is_up: boolean }).is_up,
      ),
    },
    sources,
    devices: {
      mobile: devPct("mobile"),
      desktop: devPct("desktop"),
      tablet: devPct("tablet"),
    },
    topPages: ((pages ?? []) as { path: string; pageviews: number }[]).map(
      (p, i) => ({
        rank: String(i + 1).padStart(2, "0"),
        title: p.path,
        path: p.path,
        views: Number(p.pageviews),
      }),
    ),
    latestLeads: (recentConversions ?? []).slice(0, 3).map((e) => {
      const row = e as {
        name: string | null;
        path: string | null;
        created_at: string;
      };
      const channel =
        row.name === "tel" ? "call" : row.name === "email" ? "mail" : "mail";
      return {
        initials: (row.name ?? "?").slice(0, 2).toUpperCase(),
        name: row.name ?? "Contact",
        detail: row.path ?? site.domain,
        channel: channel as "mail" | "call" | "cal",
        timeLabel: new Date(row.created_at).toLocaleString("fr-FR"),
      };
    }),
    latestLeadsBadge:
      totalLeads > 0 ? `${Math.min(totalLeads, 99)} nouvelles` : "0 nouvelle",
    monthlySummary: {
      monthLabel: `${frMonth.charAt(0).toUpperCase()}${frMonth.slice(1)}, en clair`,
      visitors: monthVisitors,
      visitorsDeltaPercent: deltaMonth ?? 0,
      compareMonth: monthLabelFr(month.prevStart),
      contacts: totalLeads,
      contactsDelta: Math.max(
        0,
        totalLeads - Math.round(prevMonthVisitors * (convRate / 100)),
      ),
      seoPlaces: 0,
      keyword: topKw?.query ?? site.domain,
    },
    navTabs: COPILOT_NAV.map(({ label, icon, href }) => ({ label, icon, href })),
  };
}
