import { getDashboard } from "@/lib/get-dashboard";
import { getProfile } from "@/lib/queries/getProfile";
import { getUserSites, resolveActiveSite } from "@/lib/queries/site-context";
import type { PeriodKey } from "@/lib/queries/period";

export async function loadCopilotPage(
  siteId?: string,
  period?: PeriodKey | null,
) {
  const sites = await getUserSites();
  const site = await resolveActiveSite(siteId);
  const [data, profile] = await Promise.all([
    getDashboard(site.id, period),
    getProfile(site),
  ]);
  return { sites, site, data, profile };
}
