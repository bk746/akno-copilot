import type { ClientDashboard } from "@/lib/mock-data";
import { CopilotIcon } from "./icons";

export function TopBar({
  client,
  onAvatarClick,
}: {
  client: ClientDashboard["client"];
  onAvatarClick?: () => void;
}) {
  return (
    <header className="top">
      <button
        type="button"
        className="av av-btn"
        title={client.name}
        onClick={onAvatarClick}
      >
        {client.initials}
      </button>
      <button type="button" className="search" aria-label="Rechercher">
        <CopilotIcon name="search" />
        Rechercher
        <kbd>⌘K</kbd>
      </button>
      <span className="sp" />
      <button type="button" className="ib" aria-label="Notifications">
        <CopilotIcon name="bell" />
        <span className="dot" />
      </button>
      <button type="button" className="ib" aria-label="Rapport du mois">
        <CopilotIcon name="doc" />
      </button>
    </header>
  );
}
