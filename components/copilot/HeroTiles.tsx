"use client";

import { useEffect, useRef } from "react";
import type { CopilotPageKey } from "@/lib/copilot-pages";
import { TILE_CFG } from "@/lib/copilot-pages";
import { useMediaQuery, useParallaxTiles } from "./hooks";

const BM = [
  "q4",
  "",
  "",
  "q3",
  "",
  "q1",
  "q2",
  "",
  "q2",
  "",
  "",
  "q1",
  "c",
  "q3",
  "",
  "",
  "",
  "",
  "q4",
  "q2",
];

const BD = [
  "q4",
  "",
  "q3",
  "c",
  "",
  "q1",
  "q2",
  "",
  "c",
  "q4",
  "",
  "q1",
  "",
  "",
  "q2",
  "",
  "q3",
  "q4",
  "",
  "",
  "q2",
  "",
  "q4",
  "q1",
  "",
  "c",
  "",
  "",
  "q3",
  "q1",
  "",
  "c",
  "",
  "q3",
  "q2",
  "",
  "q1",
  "",
  "",
  "q2",
  "q3",
  "",
  "q1",
  "",
  "",
  "q4",
  "",
  "q2",
  "c",
  "",
];

function tileClass(p: string): string {
  if (p === "sw") return "t sw";
  if (!p) return "t";
  if (p === "c") return "t c";
  return `t ${p}`;
}

export function HeroTiles({ page }: { page: CopilotPageKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  useParallaxTiles(ref);

  useEffect(() => {
    /* rebuild when page or breakpoint changes */
  }, [isDesktop, page]);

  const [rm, im, rd, id] = TILE_CFG[page];
  const base = isDesktop ? BD : BM;
  const rot = isDesktop ? rd : rm;
  const rotated = base.slice(rot).concat(base.slice(0, rot));
  const swIndex = isDesktop ? id : im;
  if (swIndex >= 0 && swIndex < rotated.length) {
    rotated[swIndex] = "sw";
  }

  const cols = isDesktop ? 10 : 4;
  const rows = isDesktop ? 5 : 5;
  const cells = rotated.slice(0, cols * rows);

  return (
    <div ref={ref} className="tiles" aria-hidden>
      {cells.map((p, i) => (
        <div key={`${page}-${isDesktop ? "d" : "m"}-${i}`} className={tileClass(p)} />
      ))}
    </div>
  );
}
