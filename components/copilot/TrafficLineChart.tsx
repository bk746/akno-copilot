"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  chartDayLabel,
  hasChartSeries,
  smoothPath,
} from "@/lib/chart-utils";
import { fmtNum } from "@/lib/copilot-format";
import { ChartEmpty } from "./ChartEmpty";

type Props = {
  visits: number[];
  previous: number[];
  chartStartDate: string;
  min?: number | null;
  max?: number | null;
  invert?: boolean;
  tipSuffix?: string;
  axisLabels?: string[];
  className?: string;
  height?: number;
};

export function TrafficLineChart(props: Props) {
  if (!hasChartSeries(props.visits)) {
    return <ChartEmpty />;
  }
  return <TrafficLineChartInner {...props} />;
}

function TrafficLineChartInner({
  visits,
  previous,
  chartStartDate,
  min = null,
  max = null,
  invert,
  tipSuffix = " visiteurs",
  axisLabels,
  className = "",
  height = 200,
}: Props) {
  const W = 600;
  const H = height;
  const pad = 10;
  const chartRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const bounds = useMemo(() => {
    const all = [...visits, ...previous];
    let lo = all.length ? Math.min(...all, 0) : 0;
    let hi = all.length ? Math.max(...all, 1) : 1;
    const pd = (hi - lo) * 0.14 || 1;
    lo -= pd;
    hi += pd;
    if (min != null) lo = min;
    if (max != null) hi = max;
    return { lo, hi };
  }, [visits, previous, min, max]);

  const toY = (v: number) => {
    let f = (v - bounds.lo) / (bounds.hi - bounds.lo);
    if (invert) f = 1 - f;
    return +(H - pad - f * (H - pad * 2)).toFixed(1);
  };

  const p = visits.map((v, i) => [
    +(i * (W / (visits.length - 1 || 1))).toFixed(1),
    toY(v),
  ]) as [number, number][];
  const q = previous.map((v, i) => [
    +(i * (W / (previous.length - 1 || 1))).toFixed(1),
    toY(v),
  ]) as [number, number][];

  const line = smoothPath(p);
  const prevLine = hasChartSeries(previous) ? smoothPath(q) : "";

  const [tip, setTip] = useState({
    show: false,
    x: 0,
    y: 0,
    label: "",
    value: 0,
    index: 0,
  });

  useEffect(() => {
    const ml = pathRef.current;
    if (!ml || !line) return;
    ml.style.setProperty("--len", String(ml.getTotalLength() * 1.6));
  }, [line]);

  const xl =
    axisLabels ??
    (visits.length > 1
      ? Array.from({ length: 5 }, (_, j) => {
          const i = Math.round((j * (visits.length - 1)) / 4);
          return chartDayLabel(chartStartDate, i);
        })
      : []);

  const onPointerMove = (e: React.PointerEvent) => {
    const box = chartRef.current;
    if (!box || visits.length === 0) return;
    const r = box.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const i = Math.max(
      0,
      Math.min(visits.length - 1, Math.round(x * (visits.length - 1))),
    );
    const pt = p[i];
    setTip({
      show: true,
      x: (pt[0] / W) * 100,
      y: (pt[1] / H) * r.height - 6,
      label: chartDayLabel(chartStartDate, i),
      value: visits[i],
      index: i,
    });
  };

  const curX = p[tip.index]?.[0] ?? 0;

  return (
    <>
      <div
        className={`chart ${className}`.trim()}
        ref={chartRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTip((t) => ({ ...t, show: false }))}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              className="gl"
              x1={0}
              x2={W}
              y1={H * f}
              y2={H * f}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {line ? (
            <path
              className="area"
              d={`${line} L${W},${H} L0,${H}Z`}
              fill="url(#ar)"
            />
          ) : null}
          {prevLine ? (
            <path
              className="line2"
              d={prevLine}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {line ? (
            <path
              ref={pathRef}
              className="line draw"
              d={line}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {tip.show ? (
            <line
              className="cur"
              x1={curX}
              x2={curX}
              y1={0}
              y2={H}
              stroke="rgba(255,255,255,.25)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              opacity={1}
            />
          ) : null}
        </svg>
        <div
          className="tip"
          style={{
            left: `${tip.x}%`,
            top: tip.y,
            opacity: tip.show ? 1 : 0,
          }}
        >
          <span>{tip.label}</span>
          {fmtNum(tip.value)}
          {tipSuffix}
        </div>
      </div>
      <div className="xl mono">
        {xl.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </>
  );
}
