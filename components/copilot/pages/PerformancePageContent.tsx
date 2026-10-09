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

function Ring({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  return (
    <div className="rg">
      <div className="ringc ringc--l">
        <svg viewBox="0 0 86 86">
          <circle className="bgc" cx={43} cy={43} r={36} />
          <circle className="fg" cx={43} cy={43} r={36} data-v={score} />
        </svg>
        <b className="num">{score || "—"}</b>
      </div>
      {label}
    </div>
  );
}

export function PerformancePageContent({
  data,
  empty,
}: {
  data: ClientDashboard;
  empty: boolean;
}) {
  useScrollReveal();
  const p = data.performancePage;
  const [device, setDevice] = useState<"m" | "d">("m");
  const run = device === "m" ? p.mobile : p.desktop;

  return (
    <div className="grid">
      {empty && !run ? (
        <div className="s12 rv in">
          <EmptyState
            title="PageSpeed en attente"
            body="Lance un audit depuis l'admin ou attends le cron quotidien."
          />
        </div>
      ) : null}

      <Card className="s12">
        <CardHeader
          icon="gauge"
          iconVariant="indigo"
          title="Scores PageSpeed"
          subtitle={
            run
              ? `Mesurés par Google · dernier audit ${run.auditedAt}`
              : "En attente du premier audit"
          }
          trailing={
            <Segment
              options={[
                { value: "m", label: "Mobile" },
                { value: "d", label: "Ordinateur" },
              ]}
              value={device}
              onChange={(v) => setDevice(v as "m" | "d")}
            />
          }
        />
        {run ? (
          <div className="rings">
            <Ring score={run.performance} label="Performance" />
            <Ring score={run.accessibility} label="Accessibilité" />
            <Ring score={run.bestPractices} label="Bonnes pratiques" />
            <Ring score={run.seo} label="SEO" />
          </div>
        ) : (
          <EmptyState compact title="Pas de scores" body="—" />
        )}
      </Card>

      <Card className="s7 s6">
        <CardHeader icon="bolt" title="Signaux web essentiels" subtitle="Ce que ressentent tes visiteurs, en clair" />
        <div style={{ marginTop: 6 }}>
          {p.vitals.length === 0 ? (
            <EmptyState compact title="Core Web Vitals" body="Disponibles après le premier audit PageSpeed." />
          ) : (
            p.vitals.map((v) => (
              <div className="li" key={v.name}>
                <div className="nm">
                  <b>{v.name}</b>
                  <span>{v.value}</span>
                </div>
                <span className={`st st--${v.status}`}>
                  {v.status === "g" ? "Bon" : v.status === "m" ? "À surveiller" : "Mauvais"}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="legend2">
          <span className="st st--g">Bon</span>
          <span className="st st--m">À surveiller</span>
          <span className="st st--b">Mauvais</span>
        </div>
      </Card>

      <div className="s6" style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <Card>
          <CardHeader icon="traffic" title="Historique du score" subtitle="Performance mobile · 12 semaines" />
          {hasChartSeries(p.scoreHistory) ? (
            <TrafficLineChart
              visits={p.scoreHistory}
              previous={[]}
              chartStartDate=""
              tipSuffix=" /100"
              height={200}
            />
          ) : (
            <ChartEmpty />
          )}
        </Card>
        <Card>
          <CardHeader icon="weight" title="Poids de la page" subtitle="Page d'accueil · mobile" />
          {p.weight ? (
            <>
              <div className="row">
                <div>
                  <div className="val num">
                    {p.weight.totalKb}
                    <small>Ko</small>
                  </div>
                  <div className="sub">Estimation depuis les métriques réseau</div>
                </div>
                <span className="st st--g">Léger</span>
              </div>
              <div className="minis">
                <div>
                  <b className="num">{p.weight.requests}</b>
                  <span>Requêtes</span>
                </div>
                <div>
                  <b className="num">{p.weight.format}</b>
                  <span>Images</span>
                </div>
                <div>
                  <b className="num">{p.weight.auditedAt}</b>
                  <span>Dernier audit</span>
                </div>
              </div>
            </>
          ) : (
            <EmptyState compact title="Poids" body="—" />
          )}
        </Card>
      </div>

      <Card className="s12">
        <CardHeader
          icon="pulse"
          title="Disponibilité"
          subtitle="Ton site est vérifié toutes les minutes"
          trailing={
            <span className="live">
              <i />En ligne
            </span>
          }
        />
        <div className="row">
          <div>
            <div className="val num">
              {data.uptime.percent}
              <small>%</small>
            </div>
            <div className="sub">
              sur 30 jours · {p.uptimeExtended.percent90} % sur 90 jours
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
              Réponse moyenne
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }} className="num">
              {p.uptimeExtended.responseMs} ms
            </div>
          </div>
        </div>
        <div className="ticks ticks--90" aria-hidden="true">
          {p.uptimeExtended.ticks90.map((down, i) => (
            <i key={i} className={down ? "w" : undefined} />
          ))}
        </div>
        <div className="sep" />
        <div className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
          Incidents · 7 derniers jours
        </div>
        {p.uptimeExtended.incidents.length === 0 ? (
          <div className="empty">
            <div className="ci">
              <CopilotIcon name="check" />
            </div>
            <b>Aucun incident</b>
            <span>Ton site a répondu à chaque vérification.</span>
          </div>
        ) : null}
      </Card>

      <div className="foot mono s12">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </div>
  );
}
