"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Site = {
  id: string;
  name: string;
  domain: string;
  public_id: string;
  url: string;
};

export function AdminPanel() {
  const [sites, setSites] = useState<Site[]>([]);
  const [snippet, setSnippet] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    url: "",
    domain: "",
    gsc_property: "",
  });

  async function load() {
    const res = await fetch("/api/admin/sites");
    const json = (await res.json()) as { sites: Site[] };
    setSites(json.sites ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await res.json()) as { snippet?: string; error?: string };
    if (json.snippet) setSnippet(json.snippet);
    await load();
  }

  async function refresh(siteId: string) {
    await fetch("/api/admin/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });
  }

  return (
    <div className="admin-wrap">
      <h1 className="admin-title">Admin AKNO Copilot</h1>

      <form className="admin-form card" onSubmit={createSite}>
        <h3>Nouveau client</h3>
        <input
          placeholder="Nom du site"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email client"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="URL https://…"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />
        <input
          placeholder="Domaine ex. client.fr"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
          required
        />
        <input
          placeholder="GSC sc-domain:client.fr"
          value={form.gsc_property}
          onChange={(e) => setForm({ ...form, gsc_property: e.target.value })}
        />
        <button type="submit" className="btn">
          Créer et inviter
        </button>
      </form>

      {snippet ? (
        <pre className="admin-snippet card">{snippet}</pre>
      ) : null}

      <div className="admin-list">
        {sites.map((s) => (
          <article key={s.id} className="card admin-row">
            <div>
              <b>{s.name}</b>
              <span className="mono">{s.public_id}</span>
            </div>
            <div className="admin-actions">
              <Link href={`/?site=${s.id}`} className="btn btn--g">
                Ouvrir
              </Link>
              <button
                type="button"
                className="btn"
                onClick={() => refresh(s.id)}
              >
                Actualiser maintenant
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
