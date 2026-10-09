import { CopilotDashboard } from "@/components/copilot/CopilotDashboard";
import { CopilotShell } from "@/components/copilot/CopilotShell";
import { PerformancePageContent } from "@/components/copilot/pages/PerformancePageContent";
import { loadCopilotPage } from "@/lib/load-page";
import { parsePeriodParam } from "@/lib/queries/period";

export default async function PerformancePage({
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
        <PerformancePageContent
          data={data}
          empty={!data.pageSpeed.mobileScore}
        />
      </CopilotDashboard>
    </CopilotShell>
  );
}
