import Link from "next/link";
import { CopilotIcon } from "./icons";

const actions = [
  { href: "#rapport", icon: "doc", label: "Rapport" },
  { href: "#trafic", icon: "traffic", label: "Trafic" },
  { href: "#seo", icon: "seo", label: "SEO" },
  {
    href: "#contact",
    icon: "chat",
    label: "Contacter AKNO",
    active: true,
  },
] as const;

export function QuickActions() {
  return (
    <div className="actions">
      {actions.map((a) => (
        <Link
          key={a.href}
          className={`act${"active" in a && a.active ? " act--on" : ""}`}
          href={a.href}
        >
          <span className="ring">
            <CopilotIcon name={a.icon} />
          </span>
          {a.label}
        </Link>
      ))}
    </div>
  );
}
