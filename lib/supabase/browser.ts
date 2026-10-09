import { createBrowserClient as createClient } from "@supabase/ssr";

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables Supabase publiques manquantes (.env.local). Voir README § Base Supabase.",
    );
  }
  return createClient(url, key);
}
