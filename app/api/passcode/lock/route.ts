import { NextResponse } from "next/server";
import { requireUser } from "@/lib/passcode/api-auth";
import { clearUnlockCookie } from "@/lib/passcode/cookie";

/** Verrouille l'app (efface akno_unlock) sans déconnecter Supabase. */
export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const res = NextResponse.json({ ok: true });
  clearUnlockCookie(res);
  return res;
}
