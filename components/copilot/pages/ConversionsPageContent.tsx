"use client";

import { useMemo, useState } from "react";
import type { ClientDashboard } from "@/lib/mock-data";
import { hasChartSeries, smoothPath } from "@/lib/chart-utils";
import { ChartEmpty } from "../ChartEmpty";
import { EmptyState } from "../EmptyState";
import { LogoAkno, CopilotIcon } from "../icons";
import { useScrollReveal } from "../hooks";
import { Card, CardHeader } from "../Card";
import { Segment } from "../Segment";
import { RevealCount } from "../RevealCount";

export function ConversionsPageContent({
  data,
  empty,
}: {
  data: ClientDashboard;
  empty: boolean;
}) {
  useScrollReveal();
  const c = data.conversionsPage;
  const [leadFilter, setLeadFilter] = useState("all");

  const filteredLeads = useMemo(() => {
    if (leadFilter === "all") return c.allLeads;
    return c.allLeads.filter((l) => l.status === leadFilter);
  }, [c.allLeads, leadFilter]);

  const showWeeklyChart =
    hasChartSeries(c.weeklyRates) ||
    (c.weeklyBars.length > 0 && c.weeklyBars.some((v) => v > 0));

  const chartSvg = useMemo(() => {
    const d = c.weeklyBars;
    const r = c.weeklyRates;
    if (!showWeeklyChart) return "";

    const W = 600;
    const H = 220;
    const n = d.length || 1;
    const bw = W / n;
    let s = '<g class="vbars">';
    [0.25, 0.5, 0.75].forEach(
      (f) =>
        (s += `<line class="gl" x1="0" x2="${W}" y1="${H * f}" y2="${H * f}" vector-effect="non-scaling-stroke"/>`),
    );
    d.forEach((v, i) => {
      const h = (v / 14) * (H - 30);
      const x = i * bw + bw * 0.22;
      s += `<rect class="vb" x="${x.toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw * 0.56).toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${i >= d.length - 4 ? "rgba(139,140,255,.38)" : "rgba(255,255,255,.1)"}" style="animation-delay:${i * 50}ms"/>`;
    });
    s += "</g>";
    if (hasChartSeries(r)) {
      const P = r.map((v, i) => [
        +(i * bw + bw / 2).toFixed(1),
        +(H - 20 - ((v - 1.5) / 2.6) * (H - 50)).toFixed(1),
      ]) as [number, number][];
      const ln = smoothPath(P);
      if (ln) {
        s += `<path class="line draw" d="${ln}" style="--len:1400" vector-effect="non-scaling-stroke"/>`;
        const last = P.at(-1)!;
        s += `<circle cx="${last[0]}" cy="${last[1]}" r="5" fill="#fff" class="area"/>`;
      }
    }
    return s;
  }, [c.weeklyBars, c.weeklyRates, showWeeklyChart]);

  const devWidths = c.typePercents.length
    ? c.typePercents
    : [52, 26, 22];

  return (
    <div className="grid">
      {empty ? (
        <div className="s12 rv in">
          <EmptyState
            title="Aucune conversion pour l'instant"
            body="Les clics tel:, mailto: et formulaires apparaîtront ici automatiquement."
          />
        </div>
      ) : null}

      <Card className="s8">
        <CardHeader
          icon="target"
          iconVariant="indigo"
          title="Demandes et taux de conversion"
          subtitle="12 dernières semaines"
          trailing={
            <div className="legend">
              <span>
                <i />Taux
              </span>
              <span>
                <i className="p" style={{ height: 8, width: 8, borderRadius: 2 }} />
                Demandes
              </span>
            </div>
          }
        />
        {showWeeklyChart && chartSvg ? (
          <>
            <div className="chart" style={{ marginTop: 18 }}>
              <svg
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
                style={{ height: 220 }}
                dangerouslySetInnerHTML={{ __html: chartSvg }}
              />
            </div>
            <div className="xl mono">
              {c.weeklyLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </>
        ) : (
          <ChartEmpty />
        )}
        <div className="kpis kpis--4">
          {c.kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <b className="num">{k.value}</b>
              <span>{k.label}</span>
              {k.delta ? (
                k.delta.includes("nouvelle") ? (
                  <em className="eq">{k.delta}</em>
                ) : (
                  <em className="up">{k.delta}</em>
                )
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="s4">
        <CardHeader icon="grid" title="Par type d'action" subtitle="Comment on te contacte" />
        <div className="dev">
          {devWidths.map((w, i) => (
            <i key={i} data-w={w} />
          ))}
        </div>
        <div className="list" style={{ marginTop: 8 }}>
          {c.typesList.map((t) => (
            <div className="li" key={t.title}>
              <div className="lav" style={{ color: "#a5a6ff" }}>
                <CopilotIcon name={t.icon} />
              </div>
              <div className="nm">
                <b>{t.title}</b>
                <span>{t.subtitle}</span>
              </div>
              <div className="vv num">
                {t.count}
                <span>{t.percent} %</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="s6">
        <CardHeader icon="funnel" title="Entonnoir de conversion" subtitle="Du premier clic à la demande" />
        <div className="fun">
          {c.funnelSteps.map((step, i) => (
            <div key={step.label}>
              <div className="fs">
                <div className="fb" data-w={step.widthPct} />
                <div className="fl">
                  <span>{step.label}</span>
                  <b>{step.value}</b>
                </div>
              </div>
              {step.stepLabel && i < c.funnelSteps.length - 1 ? (
                <div className="fstep">
                  <CopilotIcon name="chev" />
                  {step.stepLabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="s6">
        <CardHeader icon="doc" title="Conversion par page" subtitle="Les pages qui font venir des clients" />
        <div className="bars">
          {c.convByPage.map((row) => (
            <div className="bar" key={row.label}>
              <span>{row.label}</span>
              <div className="track">
                <i data-w={row.widthPct} />
              </div>
              <span className="num">{row.percent} %</span>
            </div>
          ))}
        </div>
        <div className="sep" />
        <CardHeader icon="traffic" title="Demandes par source" subtitle="D'où viennent tes contacts" />
        <div className="bars">
          {c.convBySource.map((row, i) => (
            <div className="bar" key={row.label}>
              <span>{row.label}</span>
              <div className="track">
                <i className={i > 1 ? "d" : undefined} data-w={row.widthPct} />
              </div>
              <span className="num">{row.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="s12">
        <CardHeader
          icon="mail"
          iconVariant="indigo"
          title="Dernières demandes"
          subtitle="Toutes les demandes reçues via ton site"
          trailing={
            <Segment
              options={[
                { value: "all", label: "Toutes" },
                { value: "n", label: "Nouvelles" },
                { value: "t", label: "Traitées" },
              ]}
              value={leadFilter}
              onChange={setLeadFilter}
            />
          }
        />
        {filteredLeads.length === 0 ? (
          <EmptyState compact title="Aucune demande" body="Les contacts s'afficheront ici." />
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {filteredLeads.map((l) => (
              <div className="li" key={`${l.name}-${l.timeLabel}`} data-s={l.status}>
                <div className="lav">{l.initials}</div>
                <div className="nm">
                  <b>
                    {l.name}{" "}
                    <span style={{ display: "inline", color: "var(--faint)", fontWeight: 500 }}>
                      · {l.channel}
                    </span>
                  </b>
                  <span>
                    {l.detail} ·{" "}
                    <span className="mono" style={{ display: "inline", fontSize: 10 }}>
                      {l.path}
                    </span>
                  </span>
                </div>
                <div className="vv">
                  <span className={`st st--${l.status === "n" ? "n" : "g"}`}>
                    {l.status === "n" ? "Nouveau" : "Traité"}
                  </span>
                  <span style={{ marginTop: 6 }}>{l.timeLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="foot mono s12">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </div>
  );
}
