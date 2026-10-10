// Shared by the tour page and its client-side gate.
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" aria-hidden>
      <rect x="2" y="2" width="124" height="124" rx="24" ry="24" fill="#ffffff" stroke="#111111" strokeWidth="4" />
      <g transform="translate(17.25,8.75) scale(0.85)">
        <g stroke="#111111" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="4.25">
          <line x1="55" y1="60" x2="55" y2="38.9" />
          <line x1="55" y1="80" x2="55" y2="101.1" />
          <line x1="45" y1="70" x2="23.9" y2="70" />
          <line x1="65" y1="70" x2="86.1" y2="70" />
        </g>
        <circle cx="55" cy="70" r="8.5" fill="#111111" />
        <circle cx="55" cy="31" r="6" fill="#111111" />
        <circle cx="55" cy="109" r="6" fill="#111111" />
        <circle cx="16" cy="70" r="6" fill="#111111" />
        <circle cx="94" cy="70" r="6" fill="#111111" />
      </g>
    </svg>
  );
}
