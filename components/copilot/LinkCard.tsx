"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export function LinkCard({
  href,
  className = "",
  id,
  children,
  reveal = true,
}: {
  href: string;
  className?: string;
  id?: string;
  children: ReactNode;
  reveal?: boolean;
}) {
  const router = useRouter();

  return (
    <article
      id={id}
      className={`card ${reveal ? "rv" : ""} ${className}`.trim()}
      data-href={href}
      role="link"
      tabIndex={0}
      onClick={(e) => {
        if ((e.target as Element).closest("a,button")) return;
        router.push(href);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
    >
      {children}
    </article>
  );
}
