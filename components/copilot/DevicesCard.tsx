import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

export function DevicesCard({
  data,
  embedded = false,
}: {
  data: ClientDashboard["devices"];
  embedded?: boolean;
}) {
  const segments = [
    { key: "mobile", value: data.mobile, icon: "phone", label: "Mobile" },
    { key: "desktop", value: data.desktop, icon: "laptop", label: "Ordinateur" },
    { key: "tablet", value: data.tablet, icon: "tablet", label: "Tablette" },
  ] as const;

  const body = (
    <>
      {!embedded ? (
        <CardHeader
          icon="phone"
          title="Appareils"
          subtitle="Sur quoi on te consulte"
          trailing={
            <Link className="chl" href="/trafic" aria-label="Voir le détail">
              <CopilotIcon name="chev" className="ico chev" />
            </Link>
          }
        />
      ) : (
        <CardHeader icon="phone" title="Appareils" subtitle="Sur quoi on te consulte" />
      )}
      <div className="dev">
        {segments.map((s) => (
          <i key={s.key} data-w={s.value} />
        ))}
      </div>
      <div className="devl">
        {segments.map((s) => (
          <div key={s.key}>
            <CopilotIcon name={s.icon} />
            <b className="num">{s.value} %</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </>
  );

  if (embedded) return body;
  return <Card className="s6">{body}</Card>;
}
