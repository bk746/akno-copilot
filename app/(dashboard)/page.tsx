import { CopilotDashboard } from "@/components/copilot/CopilotDashboard";
import { CopilotShell } from "@/components/copilot/CopilotShell";
import { loadCopilotPage } from "@/lib/load-page";
import { parsePeriodParam } from "@/lib/queries/period";

export default async function OverviewPage({
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
      <CopilotDashboard data={data} />
    </CopilotShell>
  );
}
