import Link from "next/link";
import type { ClientDashboard } from "@/lib/mock-data";
import { Card, CardHeader } from "./Card";
import { CopilotIcon } from "./icons";

const fr = new Intl.NumberFormat("fr-FR");

export function TopPagesCard({
  data,
}: {
  data: ClientDashboard["topPages"];
}) {
  return (
    <Card className="s6">
      <CardHeader
        icon="doc"
        title="Pages les plus vues"
        subtitle="Ce qui intéresse tes visiteurs"
        trailing={
          <Link className="chl" href="/trafic" aria-label="Voir le détail">
            <CopilotIcon name="chev" className="ico chev" />
          </Link>
        }
      />
      {data.length === 0 ? (
        <p className="mono" style={{ color: "var(--faint)", fontSize: 12 }}>
          Les pages les plus consultées s&apos;afficheront ici.
        </p>
      ) : (
        <div className="list">
          {data.map((page) => (
            <div className="li" key={page.path}>
              <span className="rk mono">{page.rank}</span>
              <div className="nm">
                <b>{page.title}</b>
                <span>{page.path}</span>
              </div>
              <div className="vv num">
                {fr.format(page.views).replace(/\s/g, "\u00a0")}
                <span>vues</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
