export function originAllowed(origin: string | null, domain: string): boolean {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:" && protocol !== "http:") return false;
    const host = hostname.toLowerCase();
    const d = domain.toLowerCase();
    return host === d || host === `www.${d}`;
  } catch {
    return false;
  }
}
