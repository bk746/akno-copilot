import { verifyCronSecret } from "@/lib/cron/auth";
import { syncPageSpeedAllSites } from "@/lib/cron/pagespeed";

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 });
  const count = await syncPageSpeedAllSites();
  return Response.json({ ok: true, sites: count });
}
