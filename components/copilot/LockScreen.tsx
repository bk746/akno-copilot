"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroTiles } from "./HeroTiles";
import { LogoAkno } from "./icons";
import { SvgDefs } from "./SvgDefs";
import { createBrowserClient } from "@/lib/supabase/browser";
import { PASSCODE_LENGTH } from "@/lib/passcode/constants";
import "./lock.css";

type Mode = "loading" | "setup" | "setup_confirm" | "unlock";

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth={2}
        strokeLinejoin="round"
        d="M20 5H9.5L4 12l5.5 7H20a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"
      />
      <path strokeWidth={2} strokeLinecap="round" d="m14.5 9.5-3 3 3 3" />
      <path strokeWidth={2} strokeLinecap="round" d="M11.5 12.5H16" />
    </svg>
  );
}

export function LockScreen({
  initials,
  firstName: initialFirstName,
  hasPasscode: initialHasPasscode,
}: {
  initials: string;
  firstName: string;
  hasPasscode: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("loading");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [digits, setDigits] = useState("");
  const [pendingSetup, setPendingSetup] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(initialHasPasscode ? "unlock" : "setup");
  }, [initialHasPasscode]);

  useEffect(() => {
    fetch("/api/passcode/status")
      .then((r) => r.json())
      .then((j: { hasPasscode?: boolean; firstName?: string }) => {
        if (j.firstName) setFirstName(j.firstName);
        setMode(j.hasPasscode ? "unlock" : "setup");
      })
      .catch(() => {});
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 480);
  }, []);

  const submitUnlock = useCallback(
    async (code: string) => {
      setBusy(true);
      setError(null);
      const res = await fetch("/api/passcode/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      });
      const json = (await res.json()) as {
        error?: string;
        lockedOut?: boolean;
      };
      setBusy(false);
      if (res.ok) {
        router.replace(next.startsWith("/") ? next : "/");
        return;
      }
      if (json.lockedOut) {
        window.location.href = "/login?error=Trop%20de%20tentatives";
        return;
      }
      setError(json.error ?? "Code incorrect");
      triggerShake();
      setDigits("");
    },
    [next, router, triggerShake],
  );

  const submitSetup = useCallback(
    async (code: string, confirm: string) => {
      setBusy(true);
      setError(null);
      const res = await fetch("/api/passcode/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code, confirmPasscode: confirm }),
      });
      const json = (await res.json()) as { error?: string };
      setBusy(false);
      if (res.ok) {
        router.replace(next.startsWith("/") ? next : "/");
        return;
      }
      setError(json.error ?? "Impossible d'enregistrer le code");
      triggerShake();
      setPendingSetup("");
      setDigits("");
      setMode("setup");
    },
    [next, router, triggerShake],
  );

  const pushDigit = useCallback(
    (d: string) => {
      if (busy || digits.length >= PASSCODE_LENGTH) return;
      const nextDigits = digits + d;
      setDigits(nextDigits);
      setError(null);
      if (nextDigits.length < PASSCODE_LENGTH) return;

      if (mode === "setup") {
        setPendingSetup(nextDigits);
        setDigits("");
        setMode("setup_confirm");
        return;
      }
      if (mode === "setup_confirm") {
        if (nextDigits !== pendingSetup) {
          setError("Les codes ne correspondent pas");
          triggerShake();
          setDigits("");
          setPendingSetup("");
          setMode("setup");
          return;
        }
        void submitSetup(pendingSetup, nextDigits);
        return;
      }
      void submitUnlock(nextDigits);
    },
    [
      busy,
      digits,
      mode,
      pendingSetup,
      submitSetup,
      submitUnlock,
      triggerShake,
    ],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") pushDigit(e.key);
      if (e.key === "Backspace") {
        setDigits((d) => d.slice(0, -1));
        setError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pushDigit]);

  async function forgotCode() {
    const supabase = createBrowserClient();
    await fetch("/api/passcode/lock", { method: "POST" });
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const title =
    mode === "setup"
      ? "Crée ton code d'accès"
      : mode === "setup_confirm"
        ? "Confirme ton code"
        : "Entre ton code";

  const subtitle =
    mode === "setup" || mode === "setup_confirm"
      ? "6 chiffres pour verrouiller Copilot sur cet appareil"
      : `Re-bonjour, ${firstName}`;

  const padKeys: Array<{ id: string; label: string; action?: "back" | "empty" }> =
    [
      { id: "1", label: "1" },
      { id: "2", label: "2" },
      { id: "3", label: "3" },
      { id: "4", label: "4" },
      { id: "5", label: "5" },
      { id: "6", label: "6" },
      { id: "7", label: "7" },
      { id: "8", label: "8" },
      { id: "9", label: "9" },
      { id: "sp", label: "", action: "empty" },
      { id: "0", label: "0" },
      { id: "bs", label: "", action: "back" },
    ];

  return (
    <>
      <SvgDefs />
      <section className="hero login-hero">
        <HeroTiles page="index" />
        <div className="hero__fade" />
        <div className="hc login-hc ak-lock-wrap">
          <div className="ak-lock-brand">
            <LogoAkno
              width={74}
              height={22}
              className="ak-lock-brandLogo"
              aria-hidden
            />
            <span className="ak-lock-brandLabel">Copilot</span>
          </div>

          <div className="ak-lock-avatar">{initials}</div>

          <div className="ak-lock-textBlock">
            <h1 className="ak-lock-title">{title}</h1>
            <p className="ak-lock-subtitle">{subtitle}</p>
          </div>

          <div
            className={`ak-lock-dots${shake ? " ak-lock-dots--shake" : ""}`}
            aria-hidden
          >
            {Array.from({ length: PASSCODE_LENGTH }, (_, i) => (
              <span
                key={i}
                className={`ak-lock-dot${
                  i < digits.length ? " ak-lock-dot--filled" : ""
                }`}
              />
            ))}
          </div>

          {error ? (
            <p
              className="ak-lock-message ak-lock-message--error"
              role="alert"
            >
              {error}
            </p>
          ) : (
            <p className="ak-lock-message ak-lock-message--hint">
              {busy ? "Vérification…" : "\u00a0"}
            </p>
          )}

          <div className="ak-lock-pad">
            {padKeys.map((key) => {
              const isEmpty = key.action === "empty";
              const isBack = key.action === "back";
              const className = [
                "ak-lock-key",
                isEmpty ? "ak-lock-key--ghost" : "",
                isBack ? "ak-lock-key--backspace" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={key.id}
                  type="button"
                  className={className}
                  disabled={busy || isEmpty}
                  onClick={() => {
                    if (isBack) {
                      setDigits((d) => d.slice(0, -1));
                      setError(null);
                    } else if (key.label) pushDigit(key.label);
                  }}
                  aria-label={
                    isBack ? "Effacer" : isEmpty ? undefined : key.label
                  }
                >
                  {isBack ? <BackspaceIcon /> : key.label}
                </button>
              );
            })}
          </div>

          {mode === "unlock" ? (
            <button
              type="button"
              className="ak-lock-forgot"
              onClick={forgotCode}
            >
              Code oublié ?
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
