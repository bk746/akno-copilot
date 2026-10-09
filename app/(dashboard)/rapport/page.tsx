import { CopilotDashboard } from "@/components/copilot/CopilotDashboard";
import { CopilotShell } from "@/components/copilot/CopilotShell";
import { RapportPageContent } from "@/components/copilot/pages/RapportPageContent";
import { loadCopilotPage } from "@/lib/load-page";
import { parsePeriodParam } from "@/lib/queries/period";

export default async function RapportPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; period?: string }>;
}) {
  const params = await searchParams;
  const { sites, site, data, profile } = await loadCopilotPage(
    params.site,
    parsePeriodParam(params.period),
  );

  return (
    <CopilotShell site={site} sites={sites} profile={profile}>
      <CopilotDashboard data={data}>
        <RapportPageContent
          data={data}
          empty={!data.hasTracking && data.hero.visitorsThisMonth === 0}
        />
      </CopilotDashboard>
    </CopilotShell>
  );
}
