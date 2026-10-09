import type { NextRequest, NextResponse } from "next/server";
import { UNLOCK_COOKIE, UNLOCK_TTL_MS } from "./constants";

type UnlockPayload = {
  userId: string;
  lastActive: number;
};

function secret(): string {
  const s = process.env.PASSCODE_SECRET;
  if (!s || s.length < 32) {
    throw new Error("PASSCODE_SECRET manquant ou trop court (min. 32 caractères)");
  }
  return s;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSha256(message: string, keyStr: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(payload: UnlockPayload): Promise<string> {
  const body = `${payload.userId}.${payload.lastActive}`;
  const sig = await hmacSha256(body, secret());
  return `${toBase64Url(new TextEncoder().encode(body))}.${sig}`;
}

async function parse(raw: string): Promise<UnlockPayload | null> {
  const [bodyB64, sig] = raw.split(".");
  if (!bodyB64 || !sig) return null;
  const body = new TextDecoder().decode(fromBase64Url(bodyB64));
  const [userId, lastActiveStr] = body.split(".");
  const lastActive = Number(lastActiveStr);
  if (!userId || !Number.isFinite(lastActive)) return null;

  const expected = await hmacSha256(body, secret());
  if (!timingSafeEqualStr(sig, expected)) return null;
  return { userId, lastActive };
}

export async function readUnlockCookie(
  request: NextRequest,
): Promise<UnlockPayload | null> {
  const raw = request.cookies.get(UNLOCK_COOKIE)?.value;
  if (!raw) return null;
  const payload = await parse(raw);
  if (!payload) return null;
  if (Date.now() - payload.lastActive > UNLOCK_TTL_MS) return null;
  return payload;
}

export async function isUnlockedForUser(
  request: NextRequest,
  userId: string,
): Promise<boolean> {
  const payload = await readUnlockCookie(request);
  return payload?.userId === userId;
}

export async function isUnlockCookieValueValid(
  raw: string | undefined,
  userId: string,
): Promise<boolean> {
  if (!raw) return false;
  const payload = await parse(raw);
  if (!payload || payload.userId !== userId) return false;
  if (Date.now() - payload.lastActive > UNLOCK_TTL_MS) return false;
  return true;
}

export async function setUnlockCookie(response: NextResponse, userId: string) {
  const value = await sign({ userId, lastActive: Date.now() });
  response.cookies.set(UNLOCK_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function clearUnlockCookie(response: NextResponse) {
  response.cookies.set(UNLOCK_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function refreshUnlockCookieIfValid(
  request: NextRequest,
  response: NextResponse,
  userId: string,
): Promise<boolean> {
  const payload = await readUnlockCookie(request);
  if (!payload || payload.userId !== userId) return false;
  await setUnlockCookie(response, userId);
  return true;
}
