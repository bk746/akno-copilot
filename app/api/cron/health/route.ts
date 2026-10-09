import { verifyCronSecret } from "@/lib/cron/auth";
import { syncHealthAllSites } from "@/lib/cron/health";

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 });
  const count = await syncHealthAllSites();
  return Response.json({ ok: true, sites: count });
}
