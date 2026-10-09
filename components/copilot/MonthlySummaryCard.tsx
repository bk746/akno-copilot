import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

const fr = new Intl.NumberFormat("fr-FR");

export function MonthlySummaryCard({
  data,
  clientName,
}: {
  data: ClientDashboard["monthlySummary"];
  clientName?: string;
}) {
  const visitors = fr.format(data.visitors).replace(/\s/g, "\u00a0");

  return (
    <Card className="card--sum s12" id="rapport">
      <CardHeader
        icon="spark"
        iconVariant="indigo"
        title="Résumé du mois"
        subtitle={data.monthLabel}
      />
      <div className="sumwrap">
        <p className="sumt">
          Ton site a reçu <em>{visitors} visiteurs</em>,{" "}
          <mark>+{data.visitorsDeltaPercent} %</mark> par rapport à{" "}
          {data.compareMonth}. <em>{data.contacts} personnes</em> t&apos;ont
          contacté, soit {data.contactsDelta} de plus que le mois dernier. Tu
          gagnes <mark>{data.seoPlaces} places</mark> sur « {data.keyword} » et
          ton site reste parmi les plus rapides du web.
        </p>
        <div className="btns">
          <Link className="btn" href="/rapport">
            <CopilotIcon name="dl" />
            Je télécharge le PDF
          </Link>
          <a
            className="btn btn--g"
            href={`mailto:hello@akno.fr?subject=Copilot%20%C2%B7%20${encodeURIComponent(clientName ?? "Client")}`}
          >
            <CopilotIcon name="chat" />
            J&apos;en parle à AKNO
          </a>
        </div>
      </div>
    </Card>
  );
}
