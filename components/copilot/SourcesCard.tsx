import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

export function SourcesCard({
  data,
  className = "s6",
  note,
  linkDetail = true,
}: {
  data: ClientDashboard["sources"];
  className?: string;
  note?: string;
  linkDetail?: boolean;
}) {
  return (
    <Card className={className}>
      <CardHeader
        icon={linkDetail ? "grid" : "traffic"}
        title="Provenance"
        subtitle="Comment on te trouve"
        trailing={
          linkDetail ? (
            <Link className="chl" href="/trafic" aria-label="Voir le détail">
              <CopilotIcon name="chev" className="ico chev" />
            </Link>
          ) : undefined
        }
      />
      <div className="bars">
        {data.map((row) => (
          <div className="bar" key={row.label}>
            <span>{row.label}</span>
            <div className="track">
              <i
                className={row.variant === "muted" ? "d" : undefined}
                data-w={row.percent}
              />
            </div>
            <span className="num">{row.percent} %</span>
          </div>
        ))}
      </div>
      {note ? (
        <div className="note">
          <CopilotIcon name="bulb" />
          <span>{note}</span>
        </div>
      ) : null}
    </Card>
  );
}
