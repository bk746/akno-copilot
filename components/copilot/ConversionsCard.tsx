"use client";

import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { hasChartSeries, seriesToPoints, smoothPath } from "@/lib/chart-utils";
import { LinkCard } from "./LinkCard";
import { CardHeader } from "./Card";
import { CopilotIcon } from "./icons";
import { RevealCount } from "./RevealCount";

export function ConversionsCard({
  data,
}: {
  data: ClientDashboard["conversions"];
}) {
  return (
    <LinkCard href="/conversions" className="s4">
      <CardHeader
        icon="target"
        iconVariant="indigo"
        title="Conversions"
        subtitle="Visiteurs devenus contacts"
        trailing={
          <Link className="chl" href="/conversions" aria-label="Voir le détail">
            <CopilotIcon name="chev" className="ico chev" />
          </Link>
        }
      />
      <div className="row">
        <div>
          <div className="val num">
            <RevealCount value={data.rate} decimals={1} suffix={<small>%</small>} />
          </div>
          <div className="sub">
            <span className="up">{data.rateDelta}</span> ce mois-ci
          </div>
        </div>
        <Sparkline values={data.sparkline} />
      </div>
      <div className="sep" />
      <div className="row" style={{ marginTop: 0, alignItems: "center" }}>
        <div>
          <div className="val num" style={{ fontSize: 28 }}>
            <RevealCount value={data.totalLeads} />
          </div>
          <div className="sub" style={{ marginTop: 4 }}>
            demandes reçues
          </div>
        </div>
        <div
          className="minis"
          style={{ margin: 0, gridTemplateColumns: "repeat(3, auto)", gap: 6 }}
        >
          <div style={{ padding: "8px 10px" }}>
            <b className="num">{data.byChannel.forms}</b>
            <span>Form.</span>
          </div>
          <div style={{ padding: "8px 10px" }}>
            <b className="num">{data.byChannel.calls}</b>
            <span>Appels</span>
          </div>
          <div style={{ padding: "8px 10px" }}>
            <b className="num">{data.byChannel.email}</b>
            <span>Email</span>
          </div>
        </div>
      </div>
    </LinkCard>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 120;
  const H = 48;
  const pts = seriesToPoints(values, W, H, 6, 2.2, 3.6);
  const d = smoothPath(pts);
  if (!hasChartSeries(values) || !d || !pts.length) {
    return <svg viewBox="0 0 120 48" width={120} height={48} aria-hidden />;
  }
  const last = pts.at(-1)!;

  return (
    <svg viewBox="0 0 120 48" width={120} height={48}>
      <path d={`${d} L${W},${H} L0,${H}Z`} fill="url(#ar)" className="area" />
      <path d={d} className="line draw" style={{ ["--len" as string]: 260 }} />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill="#fff" className="area" />
    </svg>
  );
}
