import { NextResponse } from "next/server";
import { requireUser } from "@/lib/passcode/api-auth";
import { isUnlockCookieValueValid } from "@/lib/passcode/cookie";
import { UNLOCK_COOKIE } from "@/lib/passcode/constants";
import {
  getUserSecurity,
  hashPasscode,
  setPasscodeHash,
  verifyPasscodeHash,
} from "@/lib/passcode/db";
import {
  assertMatchingPasscodes,
  normalizePasscodeInput,
} from "@/lib/passcode/validate";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const cookieStore = await cookies();
  if (
    !(await isUnlockCookieValueValid(
      cookieStore.get(UNLOCK_COOKIE)?.value,
      auth.user.id,
    ))
  ) {
    return NextResponse.json(
      { error: "Déverrouille Copilot avant de changer le code" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    oldPasscode?: string;
    newPasscode?: string;
    confirmNewPasscode?: string;
  };
  const oldCode = normalizePasscodeInput(body.oldPasscode ?? "");
  const newCode = normalizePasscodeInput(body.newPasscode ?? "");
  const confirm = normalizePasscodeInput(body.confirmNewPasscode ?? "");

  if (!oldCode || !newCode || !confirm) {
    return NextResponse.json(
      { error: "Tous les champs doivent contenir 6 chiffres" },
      { status: 400 },
    );
  }
  if (!assertMatchingPasscodes(newCode, confirm)) {
    return NextResponse.json(
      { error: "Les nouveaux codes ne correspondent pas" },
      { status: 400 },
    );
  }

  const row = await getUserSecurity(auth.user.id);
  if (!row?.passcode_hash) {
    return NextResponse.json({ error: "Aucun code configuré" }, { status: 400 });
  }

  const oldOk = await verifyPasscodeHash(oldCode, row.passcode_hash);
  if (!oldOk) {
    return NextResponse.json({ error: "Ancien code incorrect" }, { status: 401 });
  }

  const hash = await hashPasscode(newCode);
  await setPasscodeHash(auth.user.id, hash);

  return NextResponse.json({ ok: true });
}
