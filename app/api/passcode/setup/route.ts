import { NextResponse } from "next/server";
import { requireUser } from "@/lib/passcode/api-auth";
import { setUnlockCookie } from "@/lib/passcode/cookie";
import {
  getUserSecurity,
  hashPasscode,
  setPasscodeHash,
} from "@/lib/passcode/db";
import {
  assertMatchingPasscodes,
  normalizePasscodeInput,
} from "@/lib/passcode/validate";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json()) as {
    passcode?: string;
    confirmPasscode?: string;
  };
  const code = normalizePasscodeInput(body.passcode ?? "");
  const confirm = normalizePasscodeInput(body.confirmPasscode ?? "");
  if (!code || !confirm) {
    return NextResponse.json(
      { error: "Le code doit contenir 6 chiffres" },
      { status: 400 },
    );
  }
  if (!assertMatchingPasscodes(code, confirm)) {
    return NextResponse.json(
      { error: "Les deux codes ne correspondent pas" },
      { status: 400 },
    );
  }

  const existing = await getUserSecurity(auth.user.id);
  if (existing?.passcode_hash) {
    return NextResponse.json(
      { error: "Un code existe déjà. Utilise « Changer mon code »." },
      { status: 409 },
    );
  }

  const hash = await hashPasscode(code);
  await setPasscodeHash(auth.user.id, hash);

  const res = NextResponse.json({ ok: true });
  await setUnlockCookie(res, auth.user.id);
  return res;
}
