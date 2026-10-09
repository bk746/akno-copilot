"use client";

import { LoginForm } from "./LoginForm";
import { HeroTiles } from "./HeroTiles";
import { LogoAkno } from "./icons";
import { useScrollReveal } from "./hooks";

export function LoginHero() {
  useScrollReveal();

  return (
    <section className="hero login-hero">
      <HeroTiles page="index" />
      <div className="hero__fade" />
      <div className="hc login-hc">
        <div className="brand">
          <LogoAkno />
          <span className="mono">Copilot</span>
        </div>
        <p className="label">Connexion à ton espace client</p>
        <LoginForm />
      </div>
    </section>
  );
}
