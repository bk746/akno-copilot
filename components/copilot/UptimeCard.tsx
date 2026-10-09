import type { ClientDashboard } from "@/lib/mock-data";
import { LinkCard } from "./LinkCard";
import { CardHeader } from "./Card";

export function UptimeCard({
  data,
}: {
  data: ClientDashboard["uptime"];
}) {
  return (
    <LinkCard href="/performance" className="s4 r3">
      <CardHeader
        icon="pulse"
        title="Site en ligne"
        subtitle="Surveillé toutes les minutes"
        trailing={
          <span className="live">
            <i />
            En ligne
          </span>
        }
      />
      <div className="row">
        <div>
          <div className="val num">
            {data.percent}
            <small>%</small>
          </div>
          <div className="sub">Disponibilité sur 30 jours</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ color: "var(--faint)", fontSize: 10 }}>
            Réponse
          </div>
          <div
            style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}
            className="num"
          >
            {data.responseMs} ms
          </div>
        </div>
      </div>
      <div className="ticks" aria-hidden>
        {Array.from({ length: 30 }, (_, i) => (
          <i key={i} className={i === data.warningTickIndex ? "w" : undefined} />
        ))}
      </div>
    </LinkCard>
  );
}
