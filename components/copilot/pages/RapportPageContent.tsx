"use client";

import type { ClientDashboard } from "@/lib/mock-data";
import { EmptyState } from "../EmptyState";
import { LogoAkno, CopilotIcon } from "../icons";
import { useScrollReveal } from "../hooks";
import { Card, CardHeader } from "../Card";
import { hasChartSeries } from "@/lib/chart-utils";
import { ChartEmpty } from "../ChartEmpty";
import { TrafficLineChart } from "../TrafficLineChart";

export function RapportPageContent({
  data,
  empty,
}: {
  data: ClientDashboard;
  empty: boolean;
}) {
  useScrollReveal();
  const r = data.report;

  return (
    <div className="grid rapport-print">
      {empty ? (
        <div className="s12">
          <EmptyState
            title="Rapport du mois"
            body="Le résumé se génère automatiquement dès qu'il y a des visites sur la période."
          />
        </div>
      ) : null}

      <Card className="card--sum s12">
        <CardHeader
          icon="spark"
          iconVariant="indigo"
          title="En bref"
          subtitle="Ton mois en trois phrases"
          trailing={
            <span className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
              {data.client.domain}
            </span>
          }
        />
        <div className="sumwrap">
          <p className="sumt" dangerouslySetInnerHTML={{ __html: r.summaryHtml }} />
          <div className="btns">
            <button type="button" className="btn" onClick={() => window.print()}>
              <CopilotIcon name="dl" />
              Je télécharge le PDF
            </button>
            <a
              className="btn btn--g"
              href={`mailto:hello@akno.fr?subject=Rapport%20Copilot%20%C2%B7%20${encodeURIComponent(data.client.name)}`}
            >
              <CopilotIcon name="chat" />
              Je parle à AKNO
            </a>
          </div>
        </div>
      </Card>

      <Card className="s12" style={{ paddingBottom: 20 }}>
        <CardHeader icon="grid" title="Chiffres clés" subtitle="Comparés au mois précédent" />
        <div className="kpis kpis--4">
          {r.keyFigures.map((k) => (
            <div className="kpi" key={k.label}>
              <b className="num">{k.value}</b>
              <span>{k.label}</span>
              <em className="up">{k.delta}</em>
            </div>
          ))}
        </div>
      </Card>

      <Card className="s6">
        <CardHeader icon="check" title="Ce qui a bien marché" subtitle="Les bonnes nouvelles du mois" />
        <div style={{ marginTop: 8 }}>
          {r.highlights.length === 0 ? (
            <EmptyState compact title="Encore calme" body="Les highlights apparaîtront avec plus de trafic." />
          ) : (
            r.highlights.map((h) => (
              <div className="li" key={h.title}>
                <div className="nm">
                  <b>{h.title}</b>
                  <span>{h.body}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="s6">
        <CardHeader icon="traffic" title="Visiteurs sur 6 mois" subtitle="Ton site grandit, mois après mois" />
        {hasChartSeries(data.visitorsChart.visits) ? (
          <div className="chart" style={{ marginTop: 18 }}>
            <TrafficLineChart
              visits={data.visitorsChart.visits}
              previous={[]}
              chartStartDate={data.visitorsChart.chartStartDate}
              height={220}
            />
          </div>
        ) : (
          <ChartEmpty />
        )}
      </Card>

      <Card className="s12">
        <CardHeader
          icon="bulb"
          iconVariant="indigo"
          title="Nos recommandations"
          subtitle="Ce que l'équipe AKNO te conseille pour le mois prochain"
          trailing={<div className="lav" style={{ width: 34, height: 34, fontSize: 11 }}>KB</div>}
        />
        <div className="reco">
          {r.recommendations.map((rec) => (
            <div className="reco__item" key={rec.title}>
              <b>{rec.title}</b>
              <p>{rec.body}</p>
              <span className="mono">{rec.tag}</span>
            </div>
          ))}
        </div>
        <div className="btns" style={{ justifyContent: "flex-start", marginTop: 18 }}>
          <a
            className="btn"
            href={`mailto:hello@akno.fr?subject=Recommandations%20%C2%B7%20${encodeURIComponent(data.client.name)}`}
          >
            <CopilotIcon name="chat" />
            Je veux en parler à AKNO
          </a>
        </div>
      </Card>

      <div className="foot mono s12 no-print">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </div>
  );
}
