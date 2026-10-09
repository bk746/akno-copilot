import { verifyCronSecret } from "@/lib/cron/auth";
import { syncGscAllSites } from "@/lib/cron/gsc";

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) return new Response("Unauthorized", { status: 401 });
  const rows = await syncGscAllSites();
  return Response.json({ ok: true, rows });
}
