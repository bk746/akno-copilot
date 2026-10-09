import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_FAILED_ATTEMPTS } from "./constants";

export type UserSecurityRow = {
  user_id: string;
  passcode_hash: string | null;
  failed_attempts: number;
};

export async function getUserSecurity(
  userId: string,
): Promise<UserSecurityRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_security")
    .select("user_id, passcode_hash, failed_attempts")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserSecurityRow | null;
}

export async function hashPasscode(code: string): Promise<string> {
  return bcrypt.hash(code, 12);
}

export async function verifyPasscodeHash(
  code: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export async function setPasscodeHash(userId: string, hash: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("user_security").upsert(
    {
      user_id: userId,
      passcode_hash: hash,
      failed_attempts: 0,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function resetFailedAttempts(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_security")
    .update({ failed_attempts: 0 })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function incrementFailedAttempts(userId: string): Promise<number> {
  const row = await getUserSecurity(userId);
  const next = (row?.failed_attempts ?? 0) + 1;
  const admin = createAdminClient();
  const { error } = await admin.from("user_security").upsert(
    {
      user_id: userId,
      passcode_hash: row?.passcode_hash ?? null,
      failed_attempts: next,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return next;
}

export function isLockedOut(attempts: number): boolean {
  return attempts >= MAX_FAILED_ATTEMPTS;
}
