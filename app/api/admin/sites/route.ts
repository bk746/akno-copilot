import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function publicIdFromDomain(domain: string): string {
  return `site_${domain.replace(/\./g, "_").toLowerCase()}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: sites } = await admin.from("sites").select("*").order("created_at");
  return NextResponse.json({ sites: sites ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    url?: string;
    domain?: string;
    gsc_property?: string;
  };

  if (!body.name || !body.email || !body.url || !body.domain) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const admin = createAdminClient();
  const public_id = publicIdFromDomain(body.domain);

  const { data: site, error: siteError } = await admin
    .from("sites")
    .insert({
      name: body.name,
      domain: body.domain.toLowerCase(),
      url: body.url,
      public_id,
      gsc_property: body.gsc_property ?? `sc-domain:${body.domain}`,
    })
    .select("*")
    .single();

  if (siteError || !site) {
    return NextResponse.json({ error: siteError?.message }, { status: 500 });
  }

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(body.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"}/auth/callback`,
    });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  if (invited.user) {
    await admin.from("site_members").insert({
      user_id: invited.user.id,
      site_id: site.id,
      role: "owner",
    });
  }

  const snippet = `<script defer src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://copilot.akno.fr"}/t.js" data-site="${public_id}"></script>`;

  return NextResponse.json({ site, snippet });
}
