"use client";

import { useCountUp } from "./hooks";

export function AnimatedNumber({
  value,
  decimals = 0,
  className = "num",
  suffix,
  active = true,
}: {
  value: number;
  decimals?: number;
  className?: string;
  suffix?: React.ReactNode;
  active?: boolean;
}) {
  const display = useCountUp(value, { decimals, active });
  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}
