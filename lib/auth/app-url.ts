export function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  if (!raw) {
    throw new Error("NEXT_PUBLIC_APP_URL manquant");
  }
  return raw.replace(/\/$/, "");
}

export function authCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`;
}
