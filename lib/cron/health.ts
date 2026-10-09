import tls from "tls";
import { createAdminClient } from "@/lib/supabase/admin";

type HealthSnapshot = {
  is_up: boolean;
  status_code: number | null;
  response_ms: number | null;
  ssl_issuer: string | null;
  ssl_valid_to: string | null;
  domain_expires_at: string | null;
};

async function fetchHead(url: string): Promise<{ code: number; ms: number }> {
  const start = Date.now();
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  return { code: res.status, ms: Date.now() - start };
}

function sslMeta(hostname: string): Promise<{
  issuer: string | null;
  valid_to: string | null;
}> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      443,
      hostname,
      { servername: hostname, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve({
          issuer: (cert.issuer as { O?: string })?.O ?? null,
          valid_to: cert.valid_to ? new Date(cert.valid_to).toISOString() : null,
        });
      },
    );
    socket.on("error", () => resolve({ issuer: null, valid_to: null }));
  });
}

async function domainExpiry(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      events?: { eventAction?: string; eventDate?: string }[];
    };
    const exp = json.events?.find((e) => e.eventAction === "expiration");
    return exp?.eventDate ? new Date(exp.eventDate).toISOString() : null;
  } catch {
    return null;
  }
}

export async function checkSiteHealth(site: {
  id: string;
  domain: string;
  url: string;
}): Promise<HealthSnapshot> {
  let is_up = false;
  let status_code: number | null = null;
  let response_ms: number | null = null;

  try {
    const r = await fetchHead(site.url);
    status_code = r.code;
    response_ms = r.ms;
    is_up = r.code >= 200 && r.code < 500;
  } catch {
    is_up = false;
  }

  const ssl = await sslMeta(site.domain);
  const domain_expires_at = await domainExpiry(site.domain);

  return {
    is_up,
    status_code,
    response_ms,
    ssl_issuer: ssl.issuer,
    ssl_valid_to: ssl.valid_to,
    domain_expires_at,
  };
}

export async function persistSiteHealth(
  siteId: string,
  snapshot: HealthSnapshot,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("site_health").insert({
    site_id: siteId,
    ...snapshot,
  });
}

export async function syncHealthForSite(site: {
  id: string;
  domain: string;
  url: string;
}): Promise<HealthSnapshot> {
  const snapshot = await checkSiteHealth(site);
  await persistSiteHealth(site.id, snapshot);
  return snapshot;
}

export async function syncHealthAllSites(): Promise<number> {
  const admin = createAdminClient();
  const { data: sites } = await admin
    .from("sites")
    .select("id, domain, url");
  if (!sites?.length) return 0;
  for (const site of sites) {
    await syncHealthForSite(site);
  }
  return sites.length;
}

const liveCache = new Map<
  string,
  { at: number; data: HealthSnapshot }
>();

export async function getLiveHealthCached(site: {
  id: string;
  domain: string;
  url: string;
}): Promise<HealthSnapshot> {
  const hit = liveCache.get(site.id);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.data;
  const data = await checkSiteHealth(site);
  liveCache.set(site.id, { at: Date.now(), data });
  return data;
}
