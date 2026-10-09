export const CHART_EMPTY_TITLE = "Pas encore de données";
export const CHART_EMPTY_BODY =
  "Elles apparaîtront dès les premières visites";

/** Au moins 2 points pour une courbe ou une série affichable */
export function hasChartSeries(values: number[]): boolean {
  return values.length >= 2;
}

export function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function seriesToPoints(
  values: number[],
  width: number,
  height: number,
  pad: number,
  min: number,
  max: number,
): [number, number][] {
  if (values.length < 2) return [];
  const span = max - min || 1;
  const step = width / (values.length - 1);
  return values.map((v, i) => [
    +(i * step).toFixed(1),
    +(height - pad - ((v - min) / span) * (height - pad * 2)).toFixed(1),
  ]);
}

export function chartDayLabel(startIso: string, dayIndex: number): string {
  const [y, m, d] = startIso.split("-").map(Number);
  const date = new Date(y, m - 1, d + dayIndex);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
