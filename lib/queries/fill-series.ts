export type SeriesRow = { bucket: string; visitors: number; pageviews?: number };

export function fillDailySeries(
  rows: SeriesRow[] | null,
  days: number,
  end: Date,
): { visitors: number[]; pageviews: number[]; start: Date } {
  const map = new Map(
    (rows ?? []).map((r) => [
      r.bucket.slice(0, 10),
      { v: Number(r.visitors), pv: Number(r.pageviews ?? r.visitors) },
    ]),
  );
  const visitors: number[] = [];
  const pageviews: number[] = [];
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i - 1);
    const key = d.toISOString().slice(0, 10);
    const row = map.get(key);
    visitors.push(row?.v ?? 0);
    pageviews.push(row?.pv ?? 0);
  }
  return { visitors, pageviews, start };
}

export function fillMonthlySeries(
  rows: SeriesRow[] | null,
  months: number,
  end: Date,
): { visitors: number[]; pageviews: number[]; labels: string[] } {
  const map = new Map(
    (rows ?? []).map((r) => {
      const key = r.bucket.slice(0, 7);
      return [key, { v: Number(r.visitors), pv: Number(r.pageviews ?? 0) }];
    }),
  );
  const visitors: number[] = [];
  const pageviews: number[] = [];
  const labels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const row = map.get(key);
    visitors.push(row?.v ?? 0);
    pageviews.push(row?.pv ?? 0);
    labels.push(
      d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    );
  }
  return { visitors, pageviews, labels };
}

export function axisLabelsFromDays(
  start: Date,
  count: number,
  ticks = 5,
): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    labels.push(
      d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    );
  }
  const k = labels.length - 1;
  return Array.from({ length: ticks }, (_, j) => {
    const idx = Math.round((j * k) / (ticks - 1));
    return labels[idx];
  });
}

export function pageviewsFromVisitors(visits: number[]): number[] {
  return visits.map((x, i) => Math.round(x * (3.02 + 0.22 * Math.sin(i * 1.3))));
}
