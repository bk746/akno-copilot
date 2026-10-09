export type DeviceType = "mobile" | "desktop" | "tablet";

export function parseDevice(ua: string): DeviceType {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

export function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless/i.test(
    ua,
  );
}
