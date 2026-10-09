"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UNLOCK_TTL_MS } from "@/lib/passcode/constants";

const HIDDEN_AT_KEY = "akno_hidden_at";

export function PasscodeActivityListener() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/lock" || pathname === "/login") return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sessionStorage.setItem(HIDDEN_AT_KEY, String(Date.now()));
        return;
      }
      const raw = sessionStorage.getItem(HIDDEN_AT_KEY);
      if (!raw) return;
      const hiddenAt = Number(raw);
      if (!Number.isFinite(hiddenAt)) return;
      if (Date.now() - hiddenAt >= UNLOCK_TTL_MS) {
        sessionStorage.removeItem(HIDDEN_AT_KEY);
        void fetch("/api/passcode/lock", { method: "POST" }).finally(() => {
          if (pathnameRef.current !== "/lock") {
            router.replace(
              `/lock?next=${encodeURIComponent(pathnameRef.current || "/")}`,
            );
          }
        });
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pathname, router]);

  return null;
}
