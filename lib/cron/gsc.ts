import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

function getSearchConsoleAuth() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!b64) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON manquant");
  const credentials = JSON.parse(
    Buffer.from(b64, "base64").toString("utf8"),
  ) as Record<string, string>;

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function syncGscForSite(site: {
  id: string;
  gsc_property: string | null;
}): Promise<number> {
  if (!site.gsc_property) return 0;

  const auth = getSearchConsoleAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(end.getDate() - 2);

  const { data } = await searchconsole.searchanalytics.query({
    siteUrl: site.gsc_property,
    requestBody: {
      startDate: isoDate(start),
      endDate: isoDate(end),
      dimensions: ["date", "query", "page"],
      rowLimit: 25000,
    },
  });

  const rows = data.rows ?? [];
  if (!rows.length) return 0;

  const admin = createAdminClient();
  const payload = rows.map((row) => ({
    site_id: site.id,
    date: row.keys?.[0] ?? isoDate(end),
    query: row.keys?.[1] ?? "",
    page: row.keys?.[2] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? null,
    position: row.position ?? null,
  }));

  const { error } = await admin.from("gsc_daily").upsert(payload, {
    onConflict: "site_id,date,query,page",
  });
  if (error) throw error;
  return payload.length;
}

export async function syncGscAllSites(): Promise<number> {
  const admin = createAdminClient();
  const { data: sites } = await admin
    .from("sites")
    .select("id, gsc_property");
  if (!sites?.length) return 0;
  let total = 0;
  for (const site of sites) {
    total += await syncGscForSite(site);
  }
  return total;
}
