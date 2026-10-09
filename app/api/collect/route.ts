import { isBot, parseBrowser, parseDevice } from "@/lib/collect/ua";
import { originAllowed } from "@/lib/collect/origin";
import { rateLimitKey } from "@/lib/collect/rate-limit";
import { daySaltUtc, visitorHash } from "@/lib/collect/visitor-hash";
import { createAdminClient } from "@/lib/supabase/admin";

type CollectBody = {
  site?: string;
  session_id?: string;
  type?: "pageview" | "click" | "conversion";
  name?: string | null;
  path?: string | null;
  referrer_host?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  duration_ms?: number | null;
};

function corsHeaders(origin: string | null, domain: string): HeadersInit {
  const allowed = originAllowed(origin, domain);
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "0.0.0.0";
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) {
    return new Response(null, { status: 204 });
  }

  let hostname = "";
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return new Response(null, { status: 403 });
  }

  let domain = "akno.fr";
  try {
    const admin = createAdminClient();
    const { data: sites } = await admin.from("sites").select("domain");
    const match = sites?.find(
      (s) =>
        hostname === s.domain.toLowerCase() ||
        hostname === `www.${s.domain.toLowerCase()}`,
    );
    if (match) domain = match.domain;
  } catch {
    /* env manquante en dev */
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin, domain),
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: Request) {
  let body: CollectBody;
  try {
    body = (await req.json()) as CollectBody;
  } catch {
    return new Response(null, { status: 400 });
  }

  const publicId = body.site?.trim();
  const sessionId = body.session_id?.trim();
  const type = body.type;

  if (!publicId || !sessionId || !type) {
    return new Response(null, { status: 400 });
  }

  if (!["pageview", "click", "conversion"].includes(type)) {
    return new Response(null, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) {
    return new Response(null, { status: 202 });
  }

  const ip = clientIp(req);
  if (!rateLimitKey(ip, publicId)) {
    return new Response(null, { status: 429 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return new Response(null, { status: 503 });
  }

  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, domain")
    .eq("public_id", publicId)
    .maybeSingle();

  if (siteError || !site) {
    return new Response(null, { status: 404 });
  }

  const origin = req.headers.get("origin");
  if (!originAllowed(origin, site.domain)) {
    return new Response(null, {
      status: 403,
      headers: corsHeaders(origin, site.domain),
    });
  }

  const hash = visitorHash({
    sitePublicId: publicId,
    ip,
    userAgent: ua,
    daySalt: daySaltUtc(),
  });

  const row = {
    site_id: site.id,
    type,
    name: body.name ?? null,
    path: body.path?.slice(0, 2048) ?? null,
    referrer_host: body.referrer_host?.slice(0, 255) ?? null,
    utm_source: body.utm_source?.slice(0, 255) ?? null,
    utm_medium: body.utm_medium?.slice(0, 255) ?? null,
    utm_campaign: body.utm_campaign?.slice(0, 255) ?? null,
    device: parseDevice(ua),
    browser: parseBrowser(ua),
    country: req.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
    city: req.headers.get("x-vercel-ip-city")?.slice(0, 128) ?? null,
    visitor_hash: hash,
    session_id: sessionId.slice(0, 64),
    duration_ms:
      typeof body.duration_ms === "number" && body.duration_ms > 0
        ? Math.min(Math.round(body.duration_ms), 3_600_000)
        : null,
  };

  const { error: insertError } = await admin.from("events").insert(row);

  if (insertError) {
    console.error("collect insert", insertError.message);
    return new Response(null, { status: 500 });
  }

  return new Response(null, {
    status: 202,
    headers: corsHeaders(origin, site.domain),
  });
}
