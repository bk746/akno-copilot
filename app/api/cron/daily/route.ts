import { verifyCronSecret } from "@/lib/cron/auth";
import { syncGscAllSites } from "@/lib/cron/gsc";
import { syncHealthAllSites } from "@/lib/cron/health";
import { syncPageSpeedAllSites } from "@/lib/cron/pagespeed";

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const [pagespeed, gsc, health] = await Promise.all([
      syncPageSpeedAllSites(),
      syncGscAllSites(),
      syncHealthAllSites(),
    ]);
    return Response.json({ ok: true, pagespeed, gsc, health });
  } catch (e) {
    console.error("cron/daily", e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
