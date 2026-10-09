"use client";

import type { ClientDashboard } from "@/lib/mock-data";
import { useScrollReveal } from "./hooks";
import { ConversionsCard } from "./ConversionsCard";
import { DevicesCard } from "./DevicesCard";
import { GooglePositionCard } from "./GooglePositionCard";
import { LatestLeadsCard } from "./LatestLeadsCard";
import { MonthlySummaryCard } from "./MonthlySummaryCard";
import { PageSpeedCard } from "./PageSpeedCard";
import { SourcesCard } from "./SourcesCard";
import { TopPagesCard } from "./TopPagesCard";
import { UptimeCard } from "./UptimeCard";
import { VisitorsChartCard } from "./VisitorsChartCard";
import { EmptyState } from "./EmptyState";
import { LogoAkno } from "./icons";

export function DashboardGrid({
  data,
  empty,
}: {
  data: ClientDashboard;
  empty?: boolean;
}) {
  useScrollReveal();

  return (
    <>
      <div className="grid">
        {empty ? (
          <div className="s12 rv in">
            <EmptyState
              title="Bienvenue sur Copilot"
              body="Installe le script de suivi sur ton site pour voir les statistiques en direct."
            />
          </div>
        ) : null}
        <VisitorsChartCard data={data.visitorsChart} />
        <ConversionsCard data={data.conversions} />
        <GooglePositionCard data={data.seo} />
        <PageSpeedCard data={data.pageSpeed} />
        <UptimeCard data={data.uptime} />

        <div className="sech s12">
          <h2>D&apos;où viennent tes visiteurs</h2>
          <span className="mono">30 derniers jours</span>
        </div>

        <SourcesCard data={data.sources} />
        <DevicesCard data={data.devices} />
        <TopPagesCard data={data.topPages} />
        <LatestLeadsCard
          data={data.latestLeads}
          badge={data.latestLeadsBadge}
        />
        <MonthlySummaryCard
          data={data.monthlySummary}
          clientName={data.client.name}
        />
      </div>

      <div className="foot mono">
        <LogoAkno />
        Copilot · Un service akno.fr
      </div>
    </>
  );
}
