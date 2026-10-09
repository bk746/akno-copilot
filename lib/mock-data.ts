export type ChartPoint = { dayIndex: number; visitors: number; previous: number };

export type SourceRow = {
  label: string;
  percent: number;
  variant?: "default" | "muted";
};

export type DeviceBreakdown = {
  mobile: number;
  desktop: number;
  tablet: number;
};

export type TopPage = {
  rank: string;
  title: string;
  path: string;
  views: number;
};

export type Lead = {
  initials: string;
  name: string;
  detail: string;
  channel: "mail" | "call" | "cal";
  timeLabel: string;
};

export type LeadRow = {
  initials: string;
  name: string;
  detail: string;
  channel: string;
  path: string;
  status: "n" | "t";
  timeLabel: string;
};

export type TrafficPageData = {
  topReferrers: { host: string; category: string; visits: number }[];
  pagesTable: {
    title: string;
    path: string;
    views: number;
    duration: string;
    exitRate: string;
  }[];
  cities: { name: string; percent: number; variant?: "default" | "muted" }[];
  countryChips: { label: string; variant: "n" | "t" }[];
  newVisitorPercent: number;
  heatmapCells: { day: string; hour: number; alpha: number }[];
  heatmapInsight: string;
  sourcesNote: string;
  periodPageviews: number;
};

export type ConversionsPageData = {
  weeklyBars: number[];
  weeklyRates: number[];
  weeklyLabels: string[];
  kpis: { label: string; value: string; delta: string }[];
  typesList: {
    icon: string;
    title: string;
    subtitle: string;
    count: number;
    percent: number;
  }[];
  funnelSteps: {
    label: string;
    value: number;
    widthPct: number;
    stepLabel?: string;
  }[];
  convByPage: { label: string; percent: number; widthPct: number }[];
  convBySource: { label: string; count: number; widthPct: number }[];
  allLeads: LeadRow[];
  typePercents: number[];
};

export type SeoPageData = {
  hasData: boolean;
  chart: {
    labels: string[];
    clicks: number[];
    impressions: number[];
    position: number[];
  };
  kpis: { label: string; value: string; delta: string }[];
  keywords: {
    query: string;
    position: number;
    delta: string;
    clicks: number;
    impressions: number;
  }[];
  topPages: {
    rank: string;
    title: string;
    path: string;
    position: string;
    clicks: number;
  }[];
  indexation: { indexed: number; total: number; status: string };
};

export type PerformancePageData = {
  mobile: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    auditedAt: string;
  } | null;
  desktop: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    auditedAt: string;
  } | null;
  vitals: { name: string; value: string; status: "g" | "m" | "b" }[];
  scoreHistory: number[];
  weight: {
    totalKb: number;
    requests: number;
    format: string;
    auditedAt: string;
  } | null;
  uptimeExtended: {
    percent30: string;
    percent90: string;
    responseMs: number;
    ticks90: boolean[];
    incidents: { title: string; detail: string }[];
  };
};

export type ReportPageData = {
  summaryHtml: string;
  keyFigures: { value: string; label: string; delta: string }[];
  highlights: { title: string; body: string }[];
  recommendations: { title: string; body: string; tag: string }[];
  sixMonthVisitors: number[];
};

export type ClientDashboard = {
  hasTracking: boolean;
  hasGsc: boolean;
  client: {
    name: string;
    domain: string;
    initials: string;
  };
  hero: {
    visitorsThisMonth: number;
    deltaPercent: number;
    deltaLabel: string;
    sampleTag: string;
  };
  visitorsChart: {
    periodLabel: string;
    deltaPercent: number;
    chartStartDate: string;
    visits: number[];
    previous: number[];
    pageviews: number[];
    previousPageviews: number[];
    xLabels: string[];
    pagesViews: number;
    avgDuration: string;
    bounceRate: string;
    chartMin?: number | null;
    chartMax?: number | null;
  };
  conversions: {
    rate: number;
    rateDelta: string;
    sparkline: number[];
    totalLeads: number;
    byChannel: { forms: number; calls: number; email: number };
  };
  seo: {
    avgPosition: number;
    positionDelta: string;
    googleClicks: number;
    topKeyword: string;
    topKeywordRank: number;
    topKeywordDelta: string;
  };
  pageSpeed: {
    mobileScore: number;
    displayTime: string;
    seoScore: number;
    accessibilityScore: number;
    subtitle: string;
  };
  uptime: {
    percent: string;
    responseMs: number;
    warningTickIndex: number;
  };
  sources: SourceRow[];
  devices: DeviceBreakdown;
  topPages: TopPage[];
  latestLeads: Lead[];
  latestLeadsBadge: string;
  monthlySummary: {
    monthLabel: string;
    visitors: number;
    visitorsDeltaPercent: number;
    compareMonth: string;
    contacts: number;
    contactsDelta: number;
    seoPlaces: number;
    keyword: string;
  };
  navTabs: { label: string; icon: string; href?: string }[];
  periodKey: "7d" | "30d" | "12m";
  periodOverview: {
    visitors: number;
    deltaPercent: number | null;
    pageviews: number;
    avgDuration: string;
    bounceRate: string;
    newVisitorPct: number;
  };
  traffic: TrafficPageData;
  conversionsPage: ConversionsPageData;
  seoPage: SeoPageData;
  performancePage: PerformancePageData;
  report: ReportPageData;
};

export const MOCK_DASHBOARD: ClientDashboard = {
  hasTracking: true,
  hasGsc: true,
  client: {
    name: "Maison Alric",
    domain: "maisonalric.fr",
    initials: "MA",
  },
  hero: {
    visitorsThisMonth: 1248,
    deltaPercent: 18,
    deltaLabel: "vs septembre",
    sampleTag: "Données d'exemple · maisonalric.fr",
  },
  visitorsChart: {
    periodLabel: "30 j",
    deltaPercent: 18,
    chartStartDate: "2026-09-08",
    visits: [
      28, 31, 26, 34, 37, 33, 29, 35, 40, 38, 42, 36, 33, 41, 45, 43, 39, 47,
      50, 46, 44, 49, 53, 51, 48, 55, 58, 54, 52, 60,
    ],
    previous: [
      25, 27, 24, 28, 30, 29, 26, 30, 31, 30, 33, 31, 29, 32, 34, 33, 31, 35,
      36, 34, 33, 36, 38, 37, 35, 39, 40, 38, 37, 41,
    ],
    xLabels: ["8 sept.", "15 sept.", "22 sept.", "29 sept.", "7 oct."],
    pageviews: [],
    previousPageviews: [],
    pagesViews: 3906,
    avgDuration: "1 min 48",
    bounceRate: "38 %",
  },
  conversions: {
    rate: 3.4,
    rateDelta: "▲ 0,6 pt",
    sparkline: [2.4, 2.6, 2.5, 2.9, 2.8, 3.1, 3.0, 3.4],
    totalLeads: 42,
    byChannel: { forms: 26, calls: 11, email: 5 },
  },
  seo: {
    avgPosition: 8.2,
    positionDelta: "▲ 3 places",
    googleClicks: 612,
    topKeyword: "« architecte d'intérieur annecy »",
    topKeywordRank: 3,
    topKeywordDelta: "▲ 2",
  },
  pageSpeed: {
    mobileScore: 96,
    displayTime: "1,1 s",
    seoScore: 100,
    accessibilityScore: 98,
    subtitle: "Excellent · top 5 % du web",
  },
  uptime: {
    percent: "99,98",
    responseMs: 182,
    warningTickIndex: 17,
  },
  sources: [
    { label: "Google", percent: 58 },
    { label: "Direct", percent: 22 },
    { label: "Réseaux", percent: 13, variant: "muted" },
    { label: "Autres sites", percent: 7, variant: "muted" },
  ],
  devices: { mobile: 68, desktop: 27, tablet: 5 },
  topPages: [
    { rank: "01", title: "Accueil", path: "/", views: 1402 },
    { rank: "02", title: "Réalisations", path: "/realisations", views: 864 },
    {
      rank: "03",
      title: "Rénovation d'un chalet à Talloires",
      path: "/realisations/chalet-talloires",
      views: 517,
    },
    { rank: "04", title: "Contact", path: "/contact", views: 389 },
  ],
  latestLeads: [
    {
      initials: "CL",
      name: "Camille L.",
      detail: "Rénovation appartement · 90 m²",
      channel: "mail",
      timeLabel: "il y a 2 h",
    },
    {
      initials: "TR",
      name: "Thomas R.",
      detail: "Appel depuis la page Contact",
      channel: "call",
      timeLabel: "Hier, 17:42",
    },
    {
      initials: "SB",
      name: "Sophie B.",
      detail: "Prise de rendez-vous · chalet",
      channel: "cal",
      timeLabel: "Lun. 09:15",
    },
  ],
  latestLeadsBadge: "3 nouvelles",
  monthlySummary: {
    monthLabel: "Septembre 2026, en clair",
    visitors: 1248,
    visitorsDeltaPercent: 18,
    compareMonth: "août",
    contacts: 42,
    contactsDelta: 9,
    seoPlaces: 3,
    keyword: "architecte d'intérieur annecy",
  },
  navTabs: [
    { label: "Accueil", icon: "home" },
    { label: "Trafic", icon: "traffic" },
    { label: "Conversions", icon: "target" },
    { label: "SEO", icon: "seo" },
    { label: "Performance", icon: "gauge" },
    { label: "Rapport", icon: "doc" },
  ],
  periodKey: "30d",
  periodOverview: {
    visitors: 1248,
    deltaPercent: 18,
    pageviews: 3906,
    avgDuration: "1 min 48",
    bounceRate: "38 %",
    newVisitorPct: 74,
  },
  traffic: {
    topReferrers: [],
    pagesTable: [],
    cities: [],
    countryChips: [],
    newVisitorPercent: 74,
    heatmapCells: [],
    heatmapInsight: "",
    sourcesNote: "",
    periodPageviews: 3906,
  },
  conversionsPage: {
    weeklyBars: [],
    weeklyRates: [],
    weeklyLabels: [],
    kpis: [],
    typesList: [],
    funnelSteps: [],
    convByPage: [],
    convBySource: [],
    allLeads: [],
    typePercents: [],
  },
  seoPage: {
    hasData: true,
    chart: { labels: [], clicks: [], impressions: [], position: [] },
    kpis: [],
    keywords: [],
    topPages: [],
    indexation: { indexed: 0, total: 0, status: "—" },
  },
  performancePage: {
    mobile: null,
    desktop: null,
    vitals: [],
    scoreHistory: [],
    weight: null,
    uptimeExtended: {
      percent30: "99,98",
      percent90: "99,98",
      responseMs: 182,
      ticks90: [],
      incidents: [],
    },
  },
  report: {
    summaryHtml: "",
    keyFigures: [],
    highlights: [],
    recommendations: [],
    sixMonthVisitors: [],
  },
};
