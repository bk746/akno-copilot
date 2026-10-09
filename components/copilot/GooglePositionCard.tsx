"use client";

import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";
import { RevealCount } from "./RevealCount";

export function GooglePositionCard({
  data,
}: {
  data: ClientDashboard["seo"];
}) {
  return (
    <Card className="s4 r3" id="seo">
      <CardHeader
        icon="seo"
        title="Position Google moyenne"
        subtitle="Search Console · 28 jours"
        trailing={
          <Link className="chl" href="/seo" aria-label="Voir le détail">
            <CopilotIcon name="chev" className="ico chev" />
          </Link>
        }
      />
      <div className="row">
        <div>
          <div className="val num">
            <RevealCount value={data.avgPosition} decimals={1} />
          </div>
          <div className="sub">
            <span className="up">{data.positionDelta}</span> en un mois
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
            Clics Google
          </div>
          <div
            style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}
            className="num"
          >
            {data.googleClicks}
          </div>
        </div>
      </div>
      <div className="sep" />
      <div className="li" style={{ padding: 0 }}>
        <div className="nm">
          <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
            Mot-clé n°1
          </span>
          <b style={{ marginTop: 4 }}>{data.topKeyword}</b>
        </div>
        <div className="vv num">
          #{data.topKeywordRank}
          <span>{data.topKeywordDelta}</span>
        </div>
      </div>
    </Card>
  );
}
