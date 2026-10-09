import type { CSSProperties, ReactNode } from "react";
import { CopilotIcon } from "./icons";

type CardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  reveal?: boolean;
  style?: CSSProperties;
};

export function Card({
  children,
  className = "",
  id,
  reveal = true,
  style,
}: CardProps) {
  return (
    <article
      id={id}
      style={style}
      className={`card ${reveal ? "rv" : ""} ${className}`.trim()}
    >
      {children}
    </article>
  );
}

export function CardHeader({
  icon,
  iconVariant,
  title,
  subtitle,
  trailing,
}: {
  icon: string;
  iconVariant?: "indigo";
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="ch">
      <div className={`ci ${iconVariant === "indigo" ? "ci--i" : ""}`}>
        <CopilotIcon name={icon} />
      </div>
      <div className="ct">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {trailing}
    </div>
  );
}
