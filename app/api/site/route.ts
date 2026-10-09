import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { siteId } = (await req.json()) as { siteId?: string };
  if (!siteId) {
    return NextResponse.json({ error: "siteId requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("site_members")
    .select("site_id")
    .eq("user_id", user.id)
    .eq("site_id", siteId)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set("akno_site_id", siteId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
