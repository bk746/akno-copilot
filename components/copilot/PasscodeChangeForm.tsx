"use client";

import { useState } from "react";
import { PASSCODE_LENGTH } from "@/lib/passcode/constants";

export function PasscodeChangeForm() {
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/passcode/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPasscode: oldCode,
        newPasscode: newCode,
        confirmNewPasscode: confirm,
      }),
    });
    const json = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setErr(json.error ?? "Échec du changement");
      return;
    }
    setOldCode("");
    setNewCode("");
    setConfirm("");
    setMsg("Code d'accès mis à jour");
  }

  return (
    <form className="profile-passcode" onSubmit={onSubmit}>
      <p className="profile-label mono">Paramètres du compte</p>
      <p className="profile-value">Changer mon code d&apos;accès</p>
      {msg ? <p className="profile-passcode-ok">{msg}</p> : null}
      {err ? <p className="profile-passcode-err">{err}</p> : null}
      <label className="profile-passcode-field">
        <span>Ancien code</span>
        <input
          type="password"
          inputMode="numeric"
          pattern={`[0-9]{${PASSCODE_LENGTH}}`}
          maxLength={PASSCODE_LENGTH}
          value={oldCode}
          onChange={(e) => setOldCode(e.target.value.replace(/\D/g, ""))}
          className="login-input"
          autoComplete="off"
        />
      </label>
      <label className="profile-passcode-field">
        <span>Nouveau code</span>
        <input
          type="password"
          inputMode="numeric"
          pattern={`[0-9]{${PASSCODE_LENGTH}}`}
          maxLength={PASSCODE_LENGTH}
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ""))}
          className="login-input"
          autoComplete="off"
        />
      </label>
      <label className="profile-passcode-field">
        <span>Confirmer</span>
        <input
          type="password"
          inputMode="numeric"
          pattern={`[0-9]{${PASSCODE_LENGTH}}`}
          maxLength={PASSCODE_LENGTH}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          className="login-input"
          autoComplete="off"
        />
      </label>
      <button type="submit" className="btn btn--g" disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
