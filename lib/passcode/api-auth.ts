import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function requireUser(): Promise<
  { user: User } | { error: string; status: number }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: "Non authentifié", status: 401 };
  }
  return { user };
}

export function displayFirstName(user: User): string {
  const meta = user.user_metadata as { first_name?: string; name?: string };
  if (meta.first_name) return meta.first_name;
  if (meta.name) return String(meta.name).split(/\s+/)[0] ?? meta.name;
  const email = user.email ?? "";
  const local = email.split("@")[0] ?? "toi";
  const part = local.split(/[._-]/)[0] ?? local;
  return part.charAt(0).toUpperCase() + part.slice(1);
}
