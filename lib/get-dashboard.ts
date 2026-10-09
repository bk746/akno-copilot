import { getDashboard as loadDashboard } from "@/lib/queries/getDashboard";
import { parsePeriodParam } from "@/lib/queries/period";
import { resolveActiveSite } from "@/lib/queries/site-context";

export async function getDashboard(
  siteId?: string,
  periodParam?: string | null,
) {
  const site = await resolveActiveSite(siteId);
  const period = parsePeriodParam(periodParam);
  return loadDashboard(site, period);
}

export { getProfile } from "@/lib/queries/getProfile";
