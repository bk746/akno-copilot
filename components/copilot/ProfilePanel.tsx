"use client";

import type { ProfileData } from "@/lib/queries/getProfile";
import type { SiteRow } from "@/lib/queries/site-context";
import { createBrowserClient } from "@/lib/supabase/browser";
import { CopilotIcon } from "./icons";
import { PasscodeChangeForm } from "./PasscodeChangeForm";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function ProfilePanel({
  open,
  onClose,
  profile,
  sites,
  onSelectSite,
}: {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  sites: SiteRow[];
  onSelectSite: (siteId: string) => void;
}) {
  if (!open) return null;

  async function logout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="profile-root" role="dialog" aria-modal="true" aria-label="Profil">
      <button type="button" className="profile-backdrop" onClick={onClose} aria-label="Fermer" />
      <aside className="profile-panel">
        <header className="profile-head">
          <div className="av">{profile.site.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <b>{profile.userEmail ?? profile.site.name}</b>
            <span className="mono">{profile.site.domain}</span>
          </div>
          <button type="button" className="profile-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>

        {sites.length > 1 ? (
          <div className="profile-block">
            <p className="profile-label mono">Sites</p>
            <div className="profile-sites">
              {sites.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`profile-site${s.id === profile.site.id ? " on" : ""}`}
                  onClick={() => onSelectSite(s.id)}
                >
                  <b>{s.name}</b>
                  <span>{s.domain}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="profile-block">
          <p className="profile-label mono">Site</p>
          <p className="profile-value">{profile.url}</p>
          <p className="profile-sub">
            HTTPS {profile.httpsOk ? "actif" : "à vérifier"} · SSL{" "}
            {profile.sslIssuer ?? "—"} · expire le {fmtDate(profile.sslValidTo)}
          </p>
          <p className="profile-sub">
            Domaine · expiration {fmtDate(profile.domainExpiresAt)}
          </p>
        </div>

        <div className="profile-block">
          <p className="profile-label mono">Services connectés</p>
          <ul className="profile-services">
            <li className={profile.trackingInstalled ? "ok" : ""}>
              <CopilotIcon name="traffic" className="ico" />
              Suivi Copilot
              <span>{profile.trackingInstalled ? "Actif" : "En attente"}</span>
            </li>
            <li className={profile.searchConsoleConnected ? "ok" : ""}>
              <CopilotIcon name="seo" className="ico" />
              Search Console
              <span>{profile.searchConsoleConnected ? "Connecté" : "2–3 j"}</span>
            </li>
            <li className={profile.pageSpeedReady ? "ok" : ""}>
              <CopilotIcon name="gauge" className="ico" />
              PageSpeed
              <span>{profile.pageSpeedReady ? "Audit OK" : "Planifié"}</span>
            </li>
          </ul>
        </div>

        <div className="profile-block">
          <PasscodeChangeForm />
        </div>

        <div className="profile-actions">
          <button type="button" className="btn btn--g" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>
    </div>
  );
}
