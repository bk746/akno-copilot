"use client";

import type { ClientDashboard } from "@/lib/mock-data";
import { fmtNum, nb } from "@/lib/copilot-format";
import { DevicesCard } from "../DevicesCard";
import { EmptyState } from "../EmptyState";
import { SourcesCard } from "../SourcesCard";
import { VisitorsChartCard } from "../VisitorsChartCard";
import { LogoAkno, CopilotIcon } from "../icons";
import { useScrollReveal } from "../hooks";
import { Card, CardHeader } from "../Card";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function TraficPageContent({
  data,
  empty,
}: {
  data: ClientDashboard;
  empty: boolean;
}) {
  useScrollReveal();
  const t = data.traffic;

  const kpis = [
    [fmtNum(data.periodOverview.visitors), "Visiteurs", `+${data.periodOverview.deltaPercent ?? 0} %`],
    [nb(fmtNum(data.periodOverview.pageviews)), "Pages vues", "+—"],
    [data.periodOverview.avgDuration, "Durée moyenne", ""],
    [data.periodOverview.bounceRate, "Rebond", ""],
    [`${data.periodOverview.newVisitorPct} %`, "Nouveaux", "de nouveaux visiteurs"],
  ];

  return (
    <div className="grid">
      {empty ? (
        <div className="s12 rv in">
          <EmptyState
            title="Pas encore de trafic"
            body="Les premières visites arrivent dès que le script t.js est installé sur ton site."
          />
        </div>
      ) : null}

      <VisitorsChartCard
        data={data.visitorsChart}
        showPeriodSeg={false}
        showMetricSeg
        className="card--chart s12"
      />

      {!empty ? (
        <div className="kpis kpis--5 s12" style={{ marginTop: -8 }}>
          {kpis.map(([val, label, delta]) => (
            <div className="kpi" key={label}>
              <b className="num">{val}</b>
              <span>{label}</span>
              {delta ? (
                delta.includes("nouveaux") ? (
                  <em className="eq">{delta}</em>
                ) : (
                  <em className="up">{delta}</em>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <SourcesCard data={data.sources} className="s6" note={t.sourcesNote} />

      <Card className="s6">
        <CardHeader
          icon="link"
          title="Top référents"
          subtitle="Les sites qui t'envoient du monde"
        />
        {t.topReferrers.length === 0 ? (
          <EmptyState compact title="Aucun référent" body="Le trafic direct apparaîtra ici." />
        ) : (
          <div className="list">
            {t.topReferrers.map((r) => (
              <div className="li" key={r.host}>
                <div className="lav">
                  <CopilotIcon name="link" />
                </div>
                <div className="nm">
                  <b>{r.host}</b>
                  <span>{r.category}</span>
                </div>
                <div className="vv num">
                  {r.visits}
                  <span>visites</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="s8">
        <CardHeader
          icon="doc"
          title="Pages les plus vues"
          subtitle={`${data.visitorsChart.periodLabel} · ${nb(fmtNum(t.periodPageviews))} pages vues`}
        />
        {t.pagesTable.length === 0 ? (
          <EmptyState compact title="Aucune page" body="Les pages vues s'afficheront ici." />
        ) : (
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Vues</th>
                  <th className="hm">Durée</th>
                  <th>Sortie</th>
                </tr>
              </thead>
              <tbody>
                {t.pagesTable.map((p) => (
                  <tr key={p.path}>
                    <td>
                      {p.title}
                      <small>{p.path}</small>
                    </td>
                    <td>{p.views}</td>
                    <td className="m hm">{p.duration}</td>
                    <td className="m">{p.exitRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="s4">
        <DevicesCard data={data.devices} embedded />
        <div className="sep" />
        <CardHeader
          icon="users"
          title="Nouveaux visiteurs"
          subtitle="Première visite sur ton site"
        />
        <div className="dev" style={{ marginTop: 16 }}>
          <i data-w={data.periodOverview.newVisitorPct} />
          <i data-w={0} style={{ display: "none" }} />
          <i
            data-w={100 - data.periodOverview.newVisitorPct}
            style={{ borderRadius: "0 99px 99px 0" }}
          />
        </div>
        <div className="devl" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <b className="num">{data.periodOverview.newVisitorPct} %</b>
            <span>Nouveaux</span>
          </div>
          <div>
            <b className="num">{100 - data.periodOverview.newVisitorPct} %</b>
            <span>Récurrents</span>
          </div>
        </div>
      </Card>

      <Card className="s5 s4">
        <CardHeader icon="pin" title="Villes" subtitle="D'où l'on te visite" />
        {t.cities.length === 0 ? (
          <EmptyState compact title="Pas de géolocalisation" body="Les villes apparaîtront avec le trafic." />
        ) : (
          <>
            <div className="bars">
              {t.cities.map((c) => (
                <div className="bar" key={c.name}>
                  <span>{c.name}</span>
                  <div className="track">
                    <i className={c.variant === "muted" ? "d" : undefined} data-w={c.percent} />
                  </div>
                  <span className="num">{c.percent} %</span>
                </div>
              ))}
            </div>
            {t.countryChips.length > 0 ? (
              <>
                <div className="sep" />
                <div className="chs">
                  {t.countryChips.map((c) => (
                    <span
                      key={c.label}
                      className={`st st--${c.variant === "n" ? "n" : "t"}`}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </Card>

      <Card className="s8">
        <CardHeader
          icon="clock"
          title="Heures et jours de visite"
          subtitle="Quand tes visiteurs sont là"
          trailing={
            <span className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
              30 jours
            </span>
          }
        />
        <div className="heat">
          <span />
          {Array.from({ length: 12 }, (_, j) => (
            <span className="hx" key={j}>
              {j % 3 === 0 ? `${j * 2}h` : ""}
            </span>
          ))}
          {DAYS.flatMap((day, i) => [
            <span key={`${day}-l`}>{day}</span>,
            ...Array.from({ length: 12 }, (_, j) => {
              const cell = t.heatmapCells[i * 12 + j];
              return (
                <i
                  key={`${day}-${j}`}
                  style={{
                    ["--a" as string]: cell?.alpha ?? 0.08,
                    transitionDelay: `${(i * 12 + j) * 8}ms`,
                  }}
                  title={`${day} ${j * 2}h–${j * 2 + 2}h`}
                />
              );
            }),
          ])}
        </div>
        <div className="hleg mono">
          Moins
          <i style={{ background: "rgba(99,102,241,.08)" }} />
          <i style={{ background: "rgba(99,102,241,.35)" }} />
          <i style={{ background: "rgba(99,102,241,.65)" }} />
          <i style={{ background: "rgba(99,102,241,.95)" }} />
          Plus
        </div>
        <div className="note">
          <CopilotIcon name="bulb" />
          <span dangerouslySetInnerHTML={{ __html: t.heatmapInsight.replace(/mardi entre 20 h et 22 h/, "<b>mardi entre 20 h et 22 h</b>") }} />
        </div>
      </Card>

      <div className="foot mono s12">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </div>
  );
}
