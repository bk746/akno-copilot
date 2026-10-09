import { PASSCODE_LENGTH } from "./constants";

export function normalizePasscodeInput(raw: string): string | null {
  const code = raw.replace(/\D/g, "");
  if (code.length !== PASSCODE_LENGTH) return null;
  return code;
}

export function assertMatchingPasscodes(a: string, b: string): boolean {
  return a === b;
}
