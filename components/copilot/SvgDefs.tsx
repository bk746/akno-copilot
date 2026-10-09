export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9b9cff" />
        </linearGradient>
        <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366F1" stopOpacity={0.42} />
          <stop offset="1" stopColor="#6366F1" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lgo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
