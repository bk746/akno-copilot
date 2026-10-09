import type { ClientDashboard } from "@/lib/mock-data";
import { LinkCard } from "./LinkCard";
import { CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

const channelIcon: Record<string, string> = {
  mail: "mail",
  call: "call",
  cal: "cal",
};

export function LatestLeadsCard({
  data,
  badge,
}: {
  data: ClientDashboard["latestLeads"];
  badge: string;
}) {
  return (
    <LinkCard href="/conversions" className="s6" id="contact">
      <CardHeader
        icon="mail"
        iconVariant="indigo"
        title="Dernières demandes"
        subtitle="Reçues via ton site"
        trailing={<span className="badge mono">{badge}</span>}
      />
      {data.length === 0 ? (
        <p className="mono" style={{ color: "var(--faint)", fontSize: 12 }}>
          Les demandes apparaîtront ici dès la première conversion.
        </p>
      ) : (
        <div className="list">
          {data.map((lead) => (
            <div className="li" key={`${lead.name}-${lead.timeLabel}`}>
              <div className="lav">{lead.initials}</div>
              <div className="nm">
                <b>{lead.name}</b>
                <span>{lead.detail}</span>
              </div>
              <div className="vv">
                <CopilotIcon
                  name={channelIcon[lead.channel]}
                  className="ico"
                  style={{
                    width: 16,
                    height: 16,
                    marginLeft: "auto",
                    color: "#a5a6ff",
                  }}
                />
                <span>{lead.timeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </LinkCard>
  );
}
