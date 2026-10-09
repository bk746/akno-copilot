"use client";

import type { ClientDashboard } from "@/lib/mock-data";
import type { CopilotPageKey } from "@/lib/copilot-pages";
import { PAGE_TITLES } from "@/lib/copilot-pages";
import { PERIOD_HERO_LABEL as PERIOD_LABELS } from "@/lib/copilot-format";
import { AnimatedNumber } from "./AnimatedNumber";
import { LogoAkno, CopilotIcon } from "./icons";
import { HeroTiles } from "./HeroTiles";
import { QuickActions } from "./QuickActions";
import { TopBar } from "./TopBar";
import { useProfilePanel } from "./ProfileContext";
import { Segment } from "./Segment";
import { usePeriod } from "./usePeriod";
import { fmtNum, nb } from "@/lib/copilot-format";

export function Hero({
  data,
  page,
  empty,
}: {
  data: ClientDashboard;
  page: CopilotPageKey;
  empty?: boolean;
}) {
  const { openProfile } = useProfilePanel();
  const { period, setPeriod } = usePeriod();
  const { client, hero, periodOverview } = data;
  const isHome = page === "index";
  const [heroLabel, compareLabel] = PERIOD_LABELS[period];

  const subVisitors = periodOverview.visitors;
  const subDelta =
    periodOverview.deltaPercent != null
      ? `${periodOverview.deltaPercent >= 0 ? "+" : ""}${periodOverview.deltaPercent} %`
      : "—";

  return (
    <section className={`hero${isHome ? "" : " hero--sub"}`}>
      <HeroTiles page={page} />
      <div className="hero__fade" />

      <TopBar client={client} onAvatarClick={openProfile} />

      <div className="hc">
        <p className="print-only">
          AKNO Copilot · {client.name}
          {!isHome ? ` · ${PAGE_TITLES[page].replace("Copilot · ", "")}` : ""}
        </p>
        <div className="brand">
          <LogoAkno />
          <span className="mono">{PAGE_TITLES[page]}</span>
        </div>
        <p className="label">
          {isHome ? "Visiteurs ce mois-ci" : `Visiteurs · ${heroLabel}`}
        </p>
        <div className="big num">
          <b className="num">
            <AnimatedNumber
              value={isHome ? hero.visitorsThisMonth : subVisitors}
              active
            />
          </b>
        </div>
        <div className="delta">
          <span className="chip">
            <CopilotIcon name="up" className="ico" />
            <span className="num">
              {isHome
                ? `${hero.deltaPercent >= 0 ? "+" : ""}${hero.deltaPercent} %`
                : subDelta}
            </span>
          </span>
          {isHome ? hero.deltaLabel : compareLabel}
        </div>
        <div>
          <span className="tag mono">
            <i />
            {empty ? "Les premières visites arrivent…" : hero.sampleTag}
          </span>
        </div>
      </div>

      {isHome ? (
        <QuickActions />
      ) : (
        <>
          <div className="hseg">
            <Segment
              options={[
                { value: "7d", label: "7 jours" },
                { value: "30d", label: "30 jours" },
                { value: "12m", label: "12 mois" },
              ]}
              value={period}
              onChange={(v) => setPeriod(v as typeof period)}
            />
          </div>
          <div className="pills">
            <div className="pl">
              <b>{nb(fmtNum(periodOverview.pageviews))}</b>
              <span>Pages vues</span>
            </div>
            <div className="pl">
              <b>{periodOverview.avgDuration || "—"}</b>
              <span>Durée moy.</span>
            </div>
            <div className="pl">
              <b>{periodOverview.bounceRate || "—"}</b>
              <span>Rebond</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
