"use client";

import { useState } from "react";
import type { ClientDashboard } from "@/lib/mock-data";
import { EmptyState } from "../EmptyState";
import { LogoAkno, CopilotIcon } from "../icons";
import { useScrollReveal } from "../hooks";
import { Card, CardHeader } from "../Card";
import { Segment } from "../Segment";
import { hasChartSeries } from "@/lib/chart-utils";
import { ChartEmpty } from "../ChartEmpty";
import { TrafficLineChart } from "../TrafficLineChart";

export function SeoPageContent({
  data,
  empty = false,
}: {
  data: ClientDashboard;
  empty?: boolean;
}) {
  useScrollReveal();
  const s = data.seoPage;
  const [metric, setMetric] = useState<"c" | "i" | "p">("c");

  const series =
    metric === "i"
      ? s.chart.impressions
      : metric === "p"
        ? s.chart.position
        : s.chart.clicks;

  const titles = {
    c: "Clics depuis Google",
    i: "Impressions Google",
    p: "Position moyenne",
  };

  return (
    <div className="grid">
      {empty || !s.hasData ? (
        <div className="s12 rv in">
          <EmptyState
            title="Search Console en attente"
            body="Connecte GSC dans l'admin et lance une synchro pour voir clics, impressions et mots-clés."
          />
        </div>
      ) : null}

      <Card className="card--chart s12">
        <CardHeader
          icon="seo"
          iconVariant="indigo"
          title={titles[metric]}
          subtitle="Search Console · 28 derniers jours"
          trailing={
            <Segment
              options={[
                { value: "c", label: "Clics" },
                { value: "i", label: "Impressions" },
                { value: "p", label: "Position" },
              ]}
              value={metric}
              onChange={(v) => setMetric(v as typeof metric)}
            />
          }
        />
        {hasChartSeries(series) ? (
          <TrafficLineChart
            visits={series}
            previous={[]}
            chartStartDate={s.chart.labels[0] ?? ""}
            tipSuffix={metric === "p" ? "" : metric === "i" ? " impressions" : " clics"}
            invert={metric === "p"}
          />
        ) : (
          <ChartEmpty />
        )}
        <div className="kpis kpis--4">
          {s.kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <b className="num">{k.value}</b>
              <span>{k.label}</span>
              {k.delta !== "—" ? <em className="up">{k.delta}</em> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="s8">
        <CardHeader icon="search" title="Mots-clés" subtitle="Les recherches qui t'amènent du trafic" />
        {s.keywords.length === 0 ? (
          <EmptyState compact title="Aucun mot-clé" body="—" />
        ) : (
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Requête</th>
                  <th>Pos.</th>
                  <th>Évol.</th>
                  <th>Clics</th>
                  <th className="hm">Impr.</th>
                </tr>
              </thead>
              <tbody>
                {s.keywords.map((k) => (
                  <tr key={k.query}>
                    <td>{k.query}</td>
                    <td>
                      <span className={`pos${k.position <= 3 ? " top" : ""}`}>
                        {k.position}
                      </span>
                    </td>
                    <td>
                      <span className="eq">{k.delta}</span>
                    </td>
                    <td>{k.clicks}</td>
                    <td className="m hm">{k.impressions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="s4">
        <CardHeader icon="index" title="Indexation" subtitle="Pages connues de Google" />
        <div className="row" style={{ alignItems: "center" }}>
          <div>
            <div className="val num">
              {s.indexation.indexed}
              <small>/{s.indexation.total}</small>
            </div>
            <div className="sub">pages indexées</div>
          </div>
          <span className="st st--g">{s.indexation.status}</span>
        </div>
        <div className="dev">
          <i data-w={89} />
          <i data-w={0} style={{ display: "none" }} />
          <i data-w={11} style={{ borderRadius: "0 99px 99px 0" }} />
        </div>
      </Card>

      <Card className="s6">
        <CardHeader icon="doc" title="Pages les mieux classées" subtitle="Position moyenne et clics" />
        <div className="list">
          {s.topPages.map((p) => (
            <div className="li" key={p.path}>
              <span className="rk mono">{p.rank}</span>
              <div className="nm">
                <b>{p.title}</b>
                <span>{p.path}</span>
              </div>
              <div className="vv num">
                {p.position}
                <span>{p.clicks} clics</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="s6">
        <CardHeader
          icon="pin"
          title="Visibilité locale"
          subtitle="Ta fiche Google · 30 jours"
          trailing={<span className="st st--g">Fiche active</span>}
        />
        <EmptyState
          compact
          title="Google Business Profile"
          body="Branche ta fiche dans une prochaine version pour voir vues, appels et itinéraires."
        />
      </Card>

      <div className="foot mono s12">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </div>
  );
}
