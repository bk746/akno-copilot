"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ProfileData } from "@/lib/queries/getProfile";
import type { SiteRow } from "@/lib/queries/site-context";
import { siteInitials } from "@/lib/site-utils";
import { COPILOT_NAV } from "@/lib/nav";
import { AppShell } from "./AppShell";
import { ProfilePanel } from "./ProfilePanel";
import { ProfileContext } from "./ProfileContext";

export function CopilotShell({
  site,
  profile,
  sites,
  children,
}: {
  site: SiteRow;
  profile: ProfileData;
  sites: SiteRow[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  async function selectSite(siteId: string) {
    await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });
    window.location.reload();
  }

  return (
    <ProfileContext.Provider
      value={{ openProfile: () => setProfileOpen(true) }}
    >
      <AppShell
        data={{
          client: {
            name: site.name,
            domain: site.domain,
            initials: siteInitials(site.name),
          },
          navTabs: COPILOT_NAV.map(({ label, icon, href }) => ({
            label,
            icon,
            href,
          })),
        }}
        activePath={pathname}
        onAvatarClick={() => setProfileOpen(true)}
      >
        {children}
      </AppShell>
      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        sites={sites}
        onSelectSite={selectSite}
      />
    </ProfileContext.Provider>
  );
}
