"use client";

import type { ReactNode } from "react";

export function Segment({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`seg ${className}`.trim()} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={value === opt.value ? "on" : ""}
          data-v={opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
