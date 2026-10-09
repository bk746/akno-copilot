/** Désactiver temporairement le flux /lock : `PASSCODE_ENABLED=false` */
export function isPasscodeEnabled(): boolean {
  return process.env.PASSCODE_ENABLED !== "false";
}
