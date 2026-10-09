import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  isUnlockedForUser,
  refreshUnlockCookieIfValid,
} from "@/lib/passcode/cookie";
import { isPasscodeEnabled } from "@/lib/passcode/enabled";

const AUTH_PUBLIC_PREFIXES = [
  "/login",
  "/auth/",
  "/api/collect",
  "/t.js",
];

const PASSCODE_EXEMPT_PREFIXES = [
  "/lock",
  "/api/passcode/",
  "/api/auth/",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    matchesPrefix(pathname, AUTH_PUBLIC_PREFIXES)
  ) {
    return updateSession(request);
  }

  if (pathname.startsWith("/api/cron") || pathname === "/t.js") {
    return NextResponse.next();
  }

  let response = await updateSession(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin")) {
    const { isAdminEmail } = await import("@/lib/auth/admin");
    if (!isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (matchesPrefix(pathname, PASSCODE_EXEMPT_PREFIXES)) {
    return response;
  }

  if (!isPasscodeEnabled()) {
    return response;
  }

  if (!process.env.PASSCODE_SECRET) {
    console.error("[middleware] PASSCODE_SECRET manquant");
    return response;
  }

  try {
    if (!(await isUnlockedForUser(request, user.id))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Verrouillé", locked: true }, { status: 423 });
      }
      const lock = new URL("/lock", request.url);
      lock.searchParams.set("next", pathname);
      return NextResponse.redirect(lock);
    }
    await refreshUnlockCookieIfValid(request, response, user.id);
  } catch (e) {
    console.error("[middleware] passcode", e);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
