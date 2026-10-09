import { createHash } from "crypto";

export function visitorHash(input: {
  sitePublicId: string;
  ip: string;
  userAgent: string;
  daySalt: string;
}): string {
  const pepper = process.env.CRON_SECRET ?? "akno-dev-pepper";
  const raw = `${input.daySalt}:${input.sitePublicId}:${input.ip}:${input.userAgent}:${pepper}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function daySaltUtc(): string {
  return new Date().toISOString().slice(0, 10);
}
