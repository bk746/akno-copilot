import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getAppUrl } from "@/lib/auth/app-url";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));
  const appOrigin = getAppUrl();

  const redirectSuccess = new URL(next, appOrigin);
  const redirectFail = new URL("/login", appOrigin);

  let response = NextResponse.redirect(redirectSuccess);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("[auth/callback] Variables Supabase publiques manquantes");
    redirectFail.searchParams.set("error", "Configuration Supabase incomplète");
    return NextResponse.redirect(redirectFail);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.redirect(redirectSuccess);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      redirectFail.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectFail);
    }
    console.info("[auth/callback] Session établie (PKCE code)");
    return response;
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      console.error("[auth/callback] verifyOtp", {
        message: error.message,
        status: error.status,
        code: error.code,
        type,
      });
      redirectFail.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectFail);
    }
    console.info("[auth/callback] Session établie (verifyOtp)", { type });
    return response;
  }

  console.warn("[auth/callback] Paramètres manquants (code ou token_hash+type)");
  redirectFail.searchParams.set(
    "error",
    "Lien invalide ou expiré. Redemande un lien depuis la page de connexion.",
  );
  return NextResponse.redirect(redirectFail);
}
