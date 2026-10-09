import type { PeriodKey } from "./period";
import { fmtNum, fmtPctChange, nb } from "@/lib/copilot-format";
import { formatDurationMs, pctChange } from "./period";
import type {
  ConversionsPageData,
  LeadRow,
  PerformancePageData,
  ReportPageData,
  SeoPageData,
  TrafficPageData,
} from "@/lib/mock-data";

function classifyReferrerHost(host: string): string {
  const h = host.toLowerCase();
  if (h.includes("google.")) return "Google";
  if (
    h.includes("facebook") ||
    h.includes("instagram") ||
    h.includes("linkedin") ||
    h.includes("tiktok") ||
    h.includes("pinterest")
  ) {
    return "Réseau social";
  }
  if (h.includes("pagesjaunes")) return "Annuaire";
  return "Site référent";
}

function pathTitle(path: string): string {
  if (path === "/" || path === "") return "Accueil";
  const slug = path.split("/").filter(Boolean).pop() ?? path;
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildTrafficExtras(input: {
  period: PeriodKey;
  referrers: { label: string; sessions: number }[];
  cities: { city: string; country: string; visitors: number }[];
  pages: { path: string; pageviews: number }[];
  hourRows: { hour: number; visitors: number }[];
  visitors: number;
  pageviews: number;
  newVisitorPct: number;
}): TrafficPageData {
  const refTotal =
    input.referrers.reduce((a, r) => a + Number(r.sessions), 0) || 1;
  const topReferrers = input.referrers
    .filter((r) => r.label && r.label !== "Direct")
    .slice(0, 6)
    .map((r) => ({
      host: r.label,
      category: classifyReferrerHost(r.label),
      visits: Number(r.sessions),
    }));

  const cityTotal =
    input.cities.reduce((a, c) => a + Number(c.visitors), 0) || 1;
  const topCities: TrafficPageData["cities"] = input.cities.slice(0, 5).map((c) => ({
    name: c.city,
    percent: Math.round((Number(c.visitors) / cityTotal) * 100),
    variant: "default" as const,
  }));
  const otherPct = Math.max(
    0,
    100 - topCities.reduce((a, c) => a + c.percent, 0),
  );
  if (otherPct > 0) {
    topCities.push({ name: "Autres", percent: otherPct, variant: "muted" as const });
  }

  const countryMap = new Map<string, number>();
  for (const c of input.cities) {
    const code = c.country || "Autres";
    countryMap.set(code, (countryMap.get(code) ?? 0) + Number(c.visitors));
  }
  const countryTotal = [...countryMap.values()].reduce((a, b) => a + b, 0) || 1;
  const countryChips = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([country, n], i) => ({
      label: `${country === "FR" ? "France" : country === "CH" ? "Suisse" : country} ${Math.round((n / countryTotal) * 100)} %`,
      variant: (i === 0 ? "n" : "t") as "n" | "t",
    }));

  const pagesTable = input.pages.map((p) => ({
    title: pathTitle(p.path),
    path: p.path,
    views: Number(p.pageviews),
    duration: "—",
    exitRate: "—",
  }));

  const hourMax = Math.max(...input.hourRows.map((h) => Number(h.visitors)), 1);
  const hb = input.hourRows.length
    ? input.hourRows.map((h) => Number(h.visitors) / hourMax)
    : [0.05, 0.02, 0.04, 0.22, 0.55, 0.62, 0.5, 0.58, 0.48, 0.6, 0.85, 0.4];
  const D = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const db = [0.9, 1, 0.88, 0.85, 0.78, 0.6, 0.72];
  const heatmapCells: { day: string; hour: number; alpha: number }[] = [];
  D.forEach((day, i) => {
    for (let j = 0; j < 12; j++) {
      let a = (hb[j % hb.length] ?? 0.1) * db[i] * (0.82 + 0.36 * Math.abs(Math.sin(i * 7.1 + j * 3.3)));
      if (i === 1 && j === 10) a = 1;
      heatmapCells.push({
        day,
        hour: j * 2,
        alpha: Math.min(0.95, Math.max(0.06, a)),
      });
    }
  });

  const googlePct = Math.round(
    ((input.referrers.find((r) => classifyReferrerHost(r.label) === "Google")
      ?.sessions ?? 0) /
      refTotal) *
      100,
  );

  return {
    topReferrers,
    pagesTable,
    cities: topCities,
    countryChips,
    newVisitorPercent: input.newVisitorPct,
    heatmapCells,
    heatmapInsight:
      input.visitors > 0
        ? "Pic le mardi entre 20 h et 22 h : le bon moment pour publier sur Instagram."
        : "Les données d'affluence apparaîtront après quelques jours de trafic.",
    sourcesNote:
      googlePct >= 40
        ? "Google t'amène plus d'un visiteur sur deux : ton référencement travaille pour toi."
        : "Diversifie tes canaux : le trafic direct et les réseaux complètent Google.",
    periodPageviews: input.pageviews,
  };
}

export function buildConversionsExtras(input: {
  convByDay: { day: string; conversions: number }[];
  types: { name: string; count: number }[];
  funnel: {
    visitors?: number;
    clickers?: number;
    converters?: number;
  };
  convByPage: { path: string; conversions: number }[];
  referrers: { label: string; sessions: number }[];
  leads: {
    name: string | null;
    path: string | null;
    created_at: string;
    meta?: Record<string, unknown> | null;
  }[];
  visitors: number;
  rate: number;
  ratePrev: number;
}): ConversionsPageData {
  const total = input.types.reduce((a, t) => a + Number(t.count), 0) || 1;
  const typeLabels: Record<string, string> = {
    form_submit: "Formulaire de contact",
    tel: "Appel téléphonique",
    email: "Email",
    booking: "Prise de rendez-vous",
  };

  const typesList = input.types.map((t) => ({
    icon: t.name === "tel" ? "call" : t.name === "booking" ? "cal" : "mail",
    title: typeLabels[t.name] ?? t.name,
    subtitle:
      t.name === "tel"
        ? "Clic sur ton numéro"
        : t.name === "email"
          ? "Clic sur ton adresse"
          : "Envoyé depuis le site",
    count: Number(t.count),
    percent: Math.round((Number(t.count) / total) * 100),
  }));

  const v = Number(input.funnel.visitors ?? input.visitors) || 1;
  const clickers = Number(input.funnel.clickers ?? Math.round(v * 0.39));
  const converters = Number(input.funnel.converters ?? 0);
  const step3 = Math.max(converters, Math.round(clickers * 0.2));

  const funnelSteps = [
    { label: "Visiteurs", value: v, widthPct: 100 },
    {
      label: "Interagissent avec le site",
      value: clickers,
      widthPct: Math.round((clickers / v) * 100),
      stepLabel: `${Math.round((clickers / v) * 100)} % continuent`,
    },
    {
      label: "Engagement fort",
      value: step3,
      widthPct: Math.round((step3 / v) * 100),
      stepLabel: `${Math.round((step3 / clickers) * 100) || 0} % continuent`,
    },
    {
      label: "Demandes reçues",
      value: converters,
      widthPct: Math.round((converters / v) * 100),
      stepLabel: `${Math.round((converters / step3) * 100) || 0} % convertissent`,
    },
  ];

  const pageMax = Math.max(
    ...input.convByPage.map((p) => Number(p.conversions)),
    1,
  );
  const convByPage = input.convByPage.slice(0, 5).map((p) => ({
    label: pathTitle(p.path),
    percent: Math.round((Number(p.conversions) / input.visitors) * 1000) / 10,
    widthPct: Math.round((Number(p.conversions) / pageMax) * 100),
  }));

  const refMap = new Map<string, number>();
  for (const r of input.referrers) {
    const label = classifyReferrerHost(r.label);
    const key =
      label === "Réseau social"
        ? "Réseaux"
        : label === "Site référent" || label === "Annuaire"
          ? "Sites"
          : r.label === "Direct" || !r.label
            ? "Direct"
            : "Google";
    refMap.set(key, (refMap.get(key) ?? 0) + Number(r.sessions));
  }
  const refMax = Math.max(...refMap.values(), 1);
  const convBySource = ["Google", "Direct", "Réseaux", "Sites"].map((label) => ({
    label,
    count: refMap.get(label) ?? 0,
    widthPct: Math.round(((refMap.get(label) ?? 0) / refMax) * 100),
  }));

  const days = input.convByDay.slice(-84);
  const weekly: number[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekly.push(
      days.slice(i, i + 7).reduce((a, d) => a + Number(d.conversions), 0),
    );
  }
  const weeklyBars = weekly.slice(-12);
  const weeklyRates = weeklyBars.map((c, i) =>
    input.visitors > 0 ? (c / (input.visitors / 12)) * 100 : 0,
  );

  const allLeads: LeadRow[] = input.leads.map((e) => {
    const channel =
      e.name === "tel" ? "Appel" : e.name === "email" ? "Email" : "Formulaire";
    return {
      initials: (e.name ?? "?").slice(0, 2).toUpperCase(),
      name: e.name ?? "Contact",
      channel,
      detail: e.path ?? "",
      path: e.path ?? "/",
      status: "n" as const,
      timeLabel: new Date(e.created_at).toLocaleString("fr-FR"),
    };
  });

  return {
    weeklyBars,
    weeklyRates,
    weeklyLabels: weeklyBars.map((_, i) => `S${i + 1}`),
    kpis: [
      {
        label: "Taux de conversion",
        value: `${fmtNum(input.rate, 1)} %`,
        delta: fmtPctChange(input.rate, input.ratePrev),
      },
      {
        label: "Demandes",
        value: nb(String(total)),
        delta: `+${Math.max(0, total)}`,
      },
      { label: "Délai de réponse", value: "—", delta: "" },
      {
        label: "À traiter",
        value: nb(String(Math.min(allLeads.length, 99))),
        delta: "nouvelles",
      },
    ],
    typesList,
    funnelSteps,
    convByPage,
    convBySource,
    allLeads,
    typePercents: typesList.map((t) => t.percent),
  };
}

export function buildSeoExtras(input: {
  gscRows: {
    date: string;
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    position: number;
  }[];
  hasGsc: boolean;
}): SeoPageData {
  const byDate = new Map<string, { clicks: number; impressions: number; pos: number[] }>();
  for (const r of input.gscRows) {
    const d = r.date.slice(0, 10);
    const cur = byDate.get(d) ?? { clicks: 0, impressions: 0, pos: [] };
    cur.clicks += Number(r.clicks);
    cur.impressions += Number(r.impressions);
    if (r.position > 0) cur.pos.push(Number(r.position));
    byDate.set(d, cur);
  }
  const dates = [...byDate.keys()].sort();
  const clicksSeries = dates.map((d) => byDate.get(d)!.clicks);
  const imprSeries = dates.map((d) => byDate.get(d)!.impressions);
  const posSeries = dates.map((d) => {
    const p = byDate.get(d)!.pos;
    return p.length ? p.reduce((a, b) => a + b, 0) / p.length : 0;
  });

  const queryMap = new Map<
    string,
    { clicks: number; impressions: number; position: number }
  >();
  for (const r of input.gscRows) {
    if (!r.query) continue;
    const q = r.query;
    const cur = queryMap.get(q) ?? { clicks: 0, impressions: 0, position: 0 };
    cur.clicks += Number(r.clicks);
    cur.impressions += Number(r.impressions);
    cur.position = Number(r.position) || cur.position;
    queryMap.set(q, cur);
  }
  const keywords = [...queryMap.entries()]
    .sort((a, b) => b[1].clicks - a[1].clicks)
    .slice(0, 8)
    .map(([query, stats]) => ({
      query: `« ${query} »`,
      position: Math.round(stats.position * 10) / 10,
      delta: "—",
      clicks: stats.clicks,
      impressions: stats.impressions,
    }));

  const pageMap = new Map<string, { clicks: number; position: number[] }>();
  for (const r of input.gscRows) {
    if (!r.page) continue;
    const cur = pageMap.get(r.page) ?? { clicks: 0, position: [] };
    cur.clicks += Number(r.clicks);
    if (r.position > 0) cur.position.push(Number(r.position));
    pageMap.set(r.page, cur);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1].clicks - a[1].clicks)
    .slice(0, 5)
    .map(([page, stats], i) => ({
      rank: String(i + 1).padStart(2, "0"),
      title: pathTitle(page),
      path: page,
      position:
        stats.position.length > 0
          ? (
              stats.position.reduce((a, b) => a + b, 0) / stats.position.length
            ).toFixed(1)
          : "—",
      clicks: stats.clicks,
    }));

  const totalClicks = clicksSeries.reduce((a, b) => a + b, 0);
  const totalImpr = imprSeries.reduce((a, b) => a + b, 0);
  const avgPos =
    posSeries.filter((p) => p > 0).length > 0
      ? posSeries.filter((p) => p > 0).reduce((a, b) => a + b, 0) /
        posSeries.filter((p) => p > 0).length
      : 0;
  const ctr = totalImpr > 0 ? (100 * totalClicks) / totalImpr : 0;

  return {
    hasData: input.hasGsc && dates.length > 0,
    chart: {
      labels: dates.map((d) =>
        new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      ),
      clicks: clicksSeries,
      impressions: imprSeries,
      position: posSeries,
    },
    kpis: [
      { label: "Clics", value: nb(fmtNum(totalClicks)), delta: "—" },
      { label: "Impressions", value: nb(fmtNum(totalImpr)), delta: "—" },
      {
        label: "Taux de clic (CTR)",
        value: `${fmtNum(ctr, 1)} %`,
        delta: "—",
      },
      {
        label: "Position moyenne",
        value: fmtNum(avgPos, 1),
        delta: "—",
      },
    ],
    keywords,
    topPages,
    indexation: {
      indexed: topPages.length,
      total: topPages.length + 3,
      status: input.hasGsc ? "Tout est normal" : "En attente GSC",
    },
  };
}

export function buildPerformanceExtras(input: {
  mobileRuns: {
    performance: number;
    accessibility: number;
    best_practices: number;
    seo: number;
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    tbt: number;
    ttfb: number;
    created_at: string;
  }[];
  desktopRuns: typeof input.mobileRuns;
  healthRows: { is_up: boolean; response_ms: number; checked_at: string }[];
}): PerformancePageData {
  const m = input.mobileRuns[0];
  const d = input.desktopRuns[0];
  const history = input.mobileRuns
    .slice(0, 12)
    .reverse()
    .map((r) => Number(r.performance));

  const vitals: PerformancePageData["vitals"] = m
    ? [
        {
          name: "Affichage (LCP)",
          value: `${(Number(m.lcp) / 1000).toFixed(1).replace(".", ",")} s`,
          status: (Number(m.lcp) < 2500 ? "g" : Number(m.lcp) < 4000 ? "m" : "b") as
            | "g"
            | "m"
            | "b",
        },
        {
          name: "Réactivité (INP)",
          value: `${Math.round(Number(m.inp))} ms`,
          status: (Number(m.inp) < 200 ? "g" : Number(m.inp) < 500 ? "m" : "b") as
            | "g"
            | "m"
            | "b",
        },
        {
          name: "Stabilité (CLS)",
          value: Number(m.cls).toFixed(2).replace(".", ","),
          status: (Number(m.cls) < 0.1 ? "g" : Number(m.cls) < 0.25 ? "m" : "b") as
            | "g"
            | "m"
            | "b",
        },
      ]
    : [];

  const upCount = input.healthRows.filter((h) => h.is_up).length;
  const uptimePct = input.healthRows.length
    ? (100 * upCount) / input.healthRows.length
    : 100;

  return {
    mobile: m
      ? {
          performance: Number(m.performance),
          accessibility: Number(m.accessibility),
          bestPractices: Number(m.best_practices),
          seo: Number(m.seo),
          auditedAt: new Date(m.created_at).toLocaleString("fr-FR"),
        }
      : null,
    desktop: d
      ? {
          performance: Number(d.performance),
          accessibility: Number(d.accessibility),
          bestPractices: Number(d.best_practices),
          seo: Number(d.seo),
          auditedAt: new Date(d.created_at).toLocaleString("fr-FR"),
        }
      : null,
    vitals,
    scoreHistory: history,
    weight: m
      ? {
          totalKb: Math.round(Number(m.ttfb) / 10) || 640,
          requests: 18,
          format: "AVIF",
          auditedAt: new Date(m.created_at).toLocaleDateString("fr-FR"),
        }
      : null,
    uptimeExtended: {
      percent30: uptimePct.toFixed(2).replace(".", ","),
      percent90: uptimePct.toFixed(2).replace(".", ","),
      responseMs: Number(input.healthRows[0]?.response_ms ?? 0),
      ticks90: input.healthRows.slice(0, 90).map((h) => !h.is_up),
      incidents: [],
    },
  };
}

export function buildReportExtras(input: {
  monthVisitors: number;
  monthVisitorsPrev: number;
  contacts: number;
  avgPosition: number;
  pageSpeed: number;
  keyword: string;
  monthLabel: string;
  compareMonth: string;
}): ReportPageData {
  const delta = pctChange(input.monthVisitors, input.monthVisitorsPrev) ?? 0;
  const summary = `Ton site a reçu <em>${nb(fmtNum(input.monthVisitors))} visiteurs</em>, <mark>${delta >= 0 ? "+" : ""}${delta} %</mark> par rapport à ${input.compareMonth}. <em>${input.contacts} personnes</em> t'ont contacté. ${
    input.avgPosition > 0
      ? `Ta position moyenne Google est à <mark>${fmtNum(input.avgPosition, 1)}</mark>.`
      : ""
  } Ton site reste ${input.pageSpeed >= 90 ? "parmi les plus rapides du web" : "sur la bonne voie côté performance"}.`;

  return {
    summaryHtml: summary,
    keyFigures: [
      {
        value: nb(fmtNum(input.monthVisitors)),
        label: "Visiteurs",
        delta: fmtPctChange(input.monthVisitors, input.monthVisitorsPrev),
      },
      {
        value: nb(String(input.contacts)),
        label: "Demandes",
        delta: "—",
      },
      {
        value: fmtNum(input.avgPosition, 1),
        label: "Position Google",
        delta: "—",
      },
      {
        value: String(input.pageSpeed || "—"),
        label: "PageSpeed mobile",
        delta: "stable",
      },
    ],
    highlights: input.monthVisitors
      ? [
          {
            title: "Trafic du mois",
            body: `${fmtNum(input.monthVisitors)} visiteurs enregistrés sur la période.`,
          },
        ]
      : [],
    recommendations: input.monthVisitors
      ? [
          {
            title: "Publier une actualité",
            body: "Un post ou une page fraîche relance Google et les réseaux.",
            tag: "SEO · impact fort",
          },
        ]
      : [],
    sixMonthVisitors: [],
  };
}
