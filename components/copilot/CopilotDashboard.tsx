"use client";

import { usePathname } from "next/navigation";
import type { ClientDashboard } from "@/lib/mock-data";
import { pageKeyFromPath } from "@/lib/copilot-pages";
import { DashboardGrid } from "./DashboardGrid";
import { Hero } from "./Hero";
import { SvgDefs } from "./SvgDefs";

export function CopilotDashboard({
  data,
  showHero = true,
  children,
}: {
  data: ClientDashboard;
  showHero?: boolean;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const page = pageKeyFromPath(pathname);
  const empty = !data.hasTracking && data.hero.visitorsThisMonth === 0;

  return (
    <>
      <SvgDefs />
      {showHero ? <Hero data={data} page={page} empty={empty} /> : null}
      {children ?? <DashboardGrid data={data} empty={empty} />}
    </>
  );
}
