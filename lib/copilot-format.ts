const fr = new Intl.NumberFormat("fr-FR");

export function nb(n: number | string): string {
  return String(n).replace(/\s/g, "\u00a0");
}

export function fmtNum(v: number, dec = 0): string {
  if (dec) return v.toFixed(dec).replace(".", ",");
  return nb(fr.format(Math.round(v)));
}

export function fmtPctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100 %" : "—";
  const p = Math.round(((current - previous) / previous) * 100);
  return `${p >= 0 ? "+" : ""}${p} %`;
}

export const PERIOD_HERO_LABEL: Record<
  "7d" | "30d" | "12m",
  [label: string, compare: string]
> = {
  "7d": ["7 derniers jours", "vs la semaine précédente"],
  "30d": ["30 derniers jours", "vs les 30 jours précédents"],
  "12m": ["12 derniers mois", "vs les 12 mois précédents"],
};

export const PERIOD_CHART_TITLE: Record<"7d" | "30d" | "12m", string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "12m": "12 mois",
};
