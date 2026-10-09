"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(err);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <p className="login-msg">
        Vérifie ta boîte mail — un lien de connexion t&apos;attend.
      </p>
    );
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
      <input
        type="email"
        required
        placeholder="ton@email.fr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
        autoComplete="email"
      />
      <button type="submit" className="btn login-btn" disabled={loading}>
        {loading ? "Envoi…" : "Recevoir le lien magique"}
      </button>
    </form>
  );
}
