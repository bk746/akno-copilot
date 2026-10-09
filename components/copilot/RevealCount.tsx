"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";

export function RevealCount({
  value,
  decimals = 0,
  suffix,
}: {
  value: number;
  decimals?: number;
  suffix?: React.ReactNode;
}) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current?.closest(".rv");
    if (!el) return;
    const onReveal = () => setActive(true);
    el.addEventListener("copilot-reveal", onReveal);
    if (el.classList.contains("in")) setActive(true);
    return () => el.removeEventListener("copilot-reveal", onReveal);
  }, []);

  return (
    <span ref={ref}>
      <AnimatedNumber
        value={value}
        decimals={decimals}
        active={active}
        suffix={suffix}
      />
    </span>
  );
}
