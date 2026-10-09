import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

export function PageSpeedCard({
  data,
}: {
  data: ClientDashboard["pageSpeed"];
}) {
  const parts = data.subtitle.split(" · ");
  return (
    <Card className="s4 r3">
      <CardHeader
        icon="gauge"
        title="PageSpeed mobile"
        subtitle="Vitesse vue par Google"
        trailing={
          <Link className="chl" href="/performance" aria-label="Voir le détail">
            <CopilotIcon name="chev" className="ico chev" />
          </Link>
        }
      />
      <div className="row" style={{ alignItems: "center" }}>
        <div>
          <div className="val num">
            {data.mobileScore || "—"}
            <small>/100</small>
          </div>
          <div className="sub">
            {parts[0]}
            {parts[1] ? (
              <>
                {" · "}
                <span className="up">{parts[1]}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="ringc">
          <svg viewBox="0 0 86 86">
            <circle className="bgc" cx={43} cy={43} r={36} />
            <circle
              className="fg"
              cx={43}
              cy={43}
              r={36}
              data-v={data.mobileScore}
            />
          </svg>
          <b className="num">{data.mobileScore || "—"}</b>
        </div>
      </div>
      <div className="minis">
        <div>
          <b className="num">{data.displayTime}</b>
          <span>Affichage</span>
        </div>
        <div>
          <b className="num">{data.seoScore || "—"}</b>
          <span>SEO</span>
        </div>
        <div>
          <b className="num">{data.accessibilityScore || "—"}</b>
          <span>Accessib.</span>
        </div>
      </div>
    </Card>
  );
}
