"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PeriodKey } from "@/lib/queries/period";
import { parsePeriodParam } from "@/lib/queries/period";

export function usePeriod() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = parsePeriodParam(searchParams.get("period"));

  function setPeriod(next: PeriodKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next);
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return { period, setPeriod };
}
