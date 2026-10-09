import { NextResponse } from "next/server";
import { requireUser } from "@/lib/passcode/api-auth";
import { setUnlockCookie } from "@/lib/passcode/cookie";
import {
  getUserSecurity,
  incrementFailedAttempts,
  isLockedOut,
  resetFailedAttempts,
  verifyPasscodeHash,
} from "@/lib/passcode/db";
import { normalizePasscodeInput } from "@/lib/passcode/validate";
import { signOutAndClearUnlock } from "@/lib/passcode/sign-out-server";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json()) as { passcode?: string };
  const code = normalizePasscodeInput(body.passcode ?? "");
  if (!code) {
    return NextResponse.json(
      { error: "Le code doit contenir 6 chiffres" },
      { status: 400 },
    );
  }

  const row = await getUserSecurity(auth.user.id);
  if (!row?.passcode_hash) {
    return NextResponse.json(
      { error: "Aucun code configuré", needsSetup: true },
      { status: 400 },
    );
  }

  if (isLockedOut(row.failed_attempts)) {
    const out = await signOutAndClearUnlock();
    out.headers.set("Content-Type", "application/json");
    return new NextResponse(
      JSON.stringify({
        error: "Trop de tentatives. Reconnecte-toi par email.",
        lockedOut: true,
      }),
      { status: 403, headers: out.headers },
    );
  }

  const ok = await verifyPasscodeHash(code, row.passcode_hash);
  if (!ok) {
    const attempts = await incrementFailedAttempts(auth.user.id);
    if (isLockedOut(attempts)) {
      const out = await signOutAndClearUnlock();
      out.headers.set("Content-Type", "application/json");
      return new NextResponse(
        JSON.stringify({
          error: "Trop de tentatives. Reconnecte-toi par email.",
          lockedOut: true,
        }),
        { status: 403, headers: out.headers },
      );
    }
    return NextResponse.json(
      { error: "Code incorrect", attemptsRemaining: 5 - attempts },
      { status: 401 },
    );
  }

  await resetFailedAttempts(auth.user.id);
  const res = NextResponse.json({ ok: true });
  await setUnlockCookie(res, auth.user.id);
  return res;
}
