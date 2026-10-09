import { NextResponse } from "next/server";
import { displayFirstName, requireUser } from "@/lib/passcode/api-auth";
import { getUserSecurity } from "@/lib/passcode/db";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const row = await getUserSecurity(auth.user.id);
  return NextResponse.json({
    hasPasscode: Boolean(row?.passcode_hash),
    firstName: displayFirstName(auth.user),
  });
}
