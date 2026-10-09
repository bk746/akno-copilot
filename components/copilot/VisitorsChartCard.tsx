"use client";

import { useState } from "react";
import type { ClientDashboard } from "@/lib/mock-data";
import { PERIOD_CHART_TITLE } from "@/lib/copilot-format";
import { Card } from "./Card";
import { AnimatedNumber } from "./AnimatedNumber";
import { CopilotIcon } from "./icons";
import { Segment } from "./Segment";
import { TrafficLineChart } from "./TrafficLineChart";
import { usePeriod } from "./usePeriod";
import { RevealCount } from "./RevealCount";

export function VisitorsChartCard({
  data,
  showPeriodSeg = true,
  showMetricSeg = false,
  className = "card--chart s8",
}: {
  data: ClientDashboard["visitorsChart"];
  showPeriodSeg?: boolean;
  showMetricSeg?: boolean;
  className?: string;
}) {
  const { period, setPeriod } = usePeriod();
  const [metric, setMetric] = useState<"v" | "pv">("v");

  const series =
    metric === "pv"
      ? { cur: data.pageviews, prev: data.previousPageviews }
      : { cur: data.visits, prev: data.previous };

  const tipSuffix = metric === "pv" ? " pages vues" : " visiteurs";
  const titleMetric = metric === "pv" ? "Pages vues" : "Visiteurs";

  return (
    <Card className={className} id="trafic">
      <div className="ch">
        <div className="ci ci--i">
          <CopilotIcon name="traffic" />
        </div>
        <div className="ct">
          <h3>
            {titleMetric} · {PERIOD_CHART_TITLE[period]}
          </h3>
          <p>
            <span className="up num">+{data.deltaPercent} %</span>
            {showMetricSeg
              ? " · pointillés : période précédente"
              : " vs les 30 jours précédents"}
          </p>
        </div>
        {showMetricSeg ? (
          <Segment
            options={[
              { value: "v", label: "Visiteurs" },
              { value: "pv", label: "Pages vues" },
            ]}
            value={metric}
            onChange={(v) => setMetric(v as "v" | "pv")}
          />
        ) : showPeriodSeg ? (
          <Segment
            options={[
              { value: "7d", label: "7 j" },
              { value: "30d", label: "30 j" },
              { value: "12m", label: "12 m" },
            ]}
            value={period}
            onChange={(v) => setPeriod(v as typeof period)}
          />
        ) : null}
      </div>
      <TrafficLineChart
        visits={series.cur}
        previous={series.prev}
        chartStartDate={data.chartStartDate}
        min={metric === "pv" ? null : data.chartMin}
        max={metric === "pv" ? null : data.chartMax}
        tipSuffix={tipSuffix}
        axisLabels={data.xLabels}
      />
      {showMetricSeg ? (
        <div className="legend" style={{ marginTop: 14 }}>
          <span>
            <i />Cette période
          </span>
          <span>
            <i className="p" />
            Période précédente
          </span>
        </div>
      ) : null}
      <div className="kpis">
        <div className="kpi">
          <b className="num">
            <RevealCount value={data.pagesViews} />
          </b>
          <span>Pages vues</span>
        </div>
        <div className="kpi">
          <b className="num">{data.avgDuration}</b>
          <span>Durée moyenne</span>
        </div>
        <div className="kpi">
          <b className="num">{data.bounceRate}</b>
          <span>Taux de rebond</span>
        </div>
      </div>
    </Card>
  );
}
