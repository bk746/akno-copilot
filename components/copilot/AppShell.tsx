"use client";

import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { LogoAkno, CopilotIcon } from "./icons";
import { useMediaQuery } from "./hooks";

function NavTabs({
  tabs,
  id,
  className,
  activePath,
}: {
  tabs: ClientDashboard["navTabs"] & { href?: string }[];
  id: string;
  className?: string;
  activePath: string;
}) {
  return (
    <nav className={`tabs ${className ?? ""}`.trim()} id={id} aria-label="Navigation">
      {tabs.map((tab) => {
        const href = tab.href ?? "/";
        const on =
          href === "/"
            ? activePath === "/"
            : activePath.startsWith(href);
        return (
          <Link
            key={tab.label}
            href={href}
            className={`tab${on ? " on" : ""}`}
            aria-current={on ? "page" : undefined}
          >
            <CopilotIcon name={tab.icon} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export type AppShellData = Pick<ClientDashboard, "client"> & {
  navTabs: { label: string; icon: string; href?: string }[];
};

export function AppShell({
  data,
  children,
  activePath = "/",
  onAvatarClick,
}: {
  data: AppShellData;
  children: React.ReactNode;
  activePath?: string;
  onAvatarClick?: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { client, navTabs } = data;

  return (
    <>
      <aside className="side" aria-label="Navigation">
        <div className="side__logo">
          <LogoAkno />
          <span className="mono">Copilot</span>
        </div>
        <NavTabs tabs={navTabs} id="nav-d" activePath={activePath} />
        <div className="side__help" style={{ marginTop: "auto" }}>
          <CopilotIcon name="chat" />
          <span>
            Une question ? Ton interlocuteur AKNO répond en moins de 24 h.
          </span>
        </div>
        <div className="side__client" style={{ marginTop: 0 }}>
          <button type="button" className="av av-btn" onClick={onAvatarClick}>
            {client.initials}
          </button>
          <div>
            <b>{client.name}</b>
            <span>{client.domain}</span>
          </div>
        </div>
      </aside>

      <div className="app">
        <main className="main">{children}</main>
      </div>

      {!isDesktop ? (
        <NavTabs tabs={navTabs} id="nav-m" activePath={activePath} />
      ) : null}
    </>
  );
}
