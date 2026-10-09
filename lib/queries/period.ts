export type PeriodKey = "7d" | "30d" | "12m";

export type PeriodRange = {
  key: PeriodKey;
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  label: string;
};

export function resolvePeriod(
  key: PeriodKey = "30d",
  now = new Date(),
): PeriodRange {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  const start = new Date(end);
  const prevEnd = new Date(start);
  let prevStart = new Date(start);
  let label = "30 j";

  if (key === "7d") {
    start.setDate(end.getDate() - 7);
    prevStart.setDate(prevEnd.getDate() - 7);
    label = "7 j";
  } else if (key === "12m") {
    start.setFullYear(end.getFullYear() - 1);
    prevStart = new Date(start);
    prevStart.setFullYear(start.getFullYear() - 1);
    prevEnd.setTime(start.getTime());
    label = "12 mois";
  } else {
    start.setDate(end.getDate() - 30);
    prevStart.setDate(prevEnd.getDate() - 30);
  }

  return { key, start, end, prevStart, prevEnd, label };
}

export function calendarMonthBounds(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = start;
  return { start, end, prevStart, prevEnd };
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function formatDurationMs(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))} s`;
  const min = Math.floor(ms / 60_000);
  const sec = Math.round((ms % 60_000) / 1000);
  return sec > 0 ? `${min} min ${sec}` : `${min} min`;
}

export function parsePeriodParam(value: string | null | undefined): PeriodKey {
  if (value === "7d" || value === "12m" || value === "30d") return value;
  return "30d";
}
