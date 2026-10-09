export type CopilotPageKey =
  | "index"
  | "trafic"
  | "conversions"
  | "seo"
  | "performance"
  | "rapport";

export function pageKeyFromPath(pathname: string): CopilotPageKey {
  if (pathname.startsWith("/trafic")) return "trafic";
  if (pathname.startsWith("/conversions")) return "conversions";
  if (pathname.startsWith("/seo")) return "seo";
  if (pathname.startsWith("/performance")) return "performance";
  if (pathname.startsWith("/rapport")) return "rapport";
  return "index";
}

export const PAGE_TITLES: Record<CopilotPageKey, string> = {
  index: "Copilot",
  trafic: "Copilot · Trafic",
  conversions: "Copilot · Conversions",
  seo: "Copilot · SEO",
  performance: "Copilot · Performance",
  rapport: "Copilot · Rapport",
};

export const TILE_CFG: Record<
  CopilotPageKey,
  [mobileRotate: number, mobileSwIndex: number, desktopRotate: number, desktopSwIndex: number]
> = {
  index: [0, 7, 0, 12],
  trafic: [2, 4, 10, 17],
  conversions: [5, 11, 20, 22],
  seo: [9, 4, 30, 27],
  performance: [13, 11, 5, 22],
  rapport: [17, 8, 40, 17],
};
