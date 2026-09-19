export function AlienSprite({ className = "", tint = "#7dffd4" }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 22 16" className={className} aria-hidden>
      <g fill={tint}>
        <rect x="6" y="0" width="2" height="2" />
        <rect x="14" y="0" width="2" height="2" />
        <rect x="8" y="2" width="2" height="2" />
        <rect x="12" y="2" width="2" height="2" />
        <rect x="6" y="4" width="10" height="2" />
        <rect x="4" y="6" width="4" height="2" />
        <rect x="10" y="6" width="2" height="2" />
        <rect x="14" y="6" width="4" height="2" />
        <rect x="2" y="8" width="18" height="2" />
        <rect x="2" y="10" width="2" height="2" />
        <rect x="6" y="10" width="10" height="2" />
        <rect x="18" y="10" width="2" height="2" />
        <rect x="2" y="12" width="2" height="2" />
        <rect x="18" y="12" width="2" height="2" />
        <rect x="8" y="14" width="2" height="2" />
        <rect x="12" y="14" width="2" height="2" />
      </g>
    </svg>
  );
}

export function ShipSprite({
  className = "",
  variant = "viper",
}: {
  className?: string;
  variant?: string;
}) {
  const accent = variant === "gold" ? "#ffd36a" : variant === "aurora" ? "#ff65ce" : "#72fff0";
  const hot = variant === "aurora" ? "#ff9be0" : variant === "gold" ? "#fff0a8" : "#c8fff8";
  const trim = variant === "aurora" ? "#ff4fbb" : variant === "gold" ? "#f4b83f" : "#39d7ff";
  const wing = variant === "aurora" ? "#7d2d67" : variant === "gold" ? "#6d4b18" : "#102a40";
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <defs>
        <linearGradient id={`hull-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9fbff" />
          <stop offset="42%" stopColor="#7cd8ea" />
          <stop offset="100%" stopColor="#17324a" />
        </linearGradient>
        <radialGradient id={`core-${variant}`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={hot} />
          <stop offset="100%" stopColor={accent} stopOpacity="0.1" />
        </radialGradient>
        <filter id={`ship-glow-${variant}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="48" cy="80" rx="20" ry="5" fill={accent} opacity="0.22" />
      <path className="engine-flame" d="M38 70 L34 91 L43 80 Z" fill={trim} opacity="0.9" />
      <path className="engine-flame" d="M58 70 L62 91 L53 80 Z" fill={trim} opacity="0.9" />
      <path className="engine-flame" d="M44 69 L46 86 L50 69 Z" fill="#fff7cf" opacity="0.75" />
      <path className="engine-flame" d="M52 69 L50 86 L46 69 Z" fill="#fff7cf" opacity="0.75" />

      <path d="M10 73 L27 48 L36 59 L26 78 Z" fill={wing} stroke={trim} strokeWidth="1.6" />
      <path d="M86 73 L69 48 L60 59 L70 78 Z" fill={wing} stroke={trim} strokeWidth="1.6" />
      <path d="M22 62 L34 55 L31 66 L20 70 Z" fill="#071626" stroke={accent} strokeOpacity="0.45" />
      <path d="M74 62 L62 55 L65 66 L76 70 Z" fill="#071626" stroke={accent} strokeOpacity="0.45" />

      <path
        d="M48 5 C55 22 65 42 68 61 C63 70 56 75 48 75 C40 75 33 70 28 61 C31 42 41 22 48 5Z"
        fill={`url(#hull-${variant})`}
        stroke={accent}
        strokeWidth="2"
        filter={`url(#ship-glow-${variant})`}
      />
      <path d="M48 13 L58 53 L48 47 L38 53 Z" fill="#0b2035" opacity="0.55" />
      <path d="M34 59 L48 50 L62 59 L55 70 L41 70 Z" fill="#071626" stroke={trim} strokeWidth="1.5" />
      <path d="M48 8 L52 27 L48 30 L44 27 Z" fill="#f4ffff" opacity="0.8" />
      <path d="M37 42 L48 37 L59 42 L55 55 L41 55 Z" fill="#06131f" stroke={accent} strokeOpacity="0.5" />
      <ellipse cx="48" cy="47" rx="9" ry="12" fill={`url(#core-${variant})`} />
      <ellipse cx="48" cy="45" rx="4" ry="6" fill="#ffffff" opacity="0.92" />
      <path d="M34 64 L48 58 L62 64" fill="none" stroke={hot} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <circle cx="31" cy="57" r="2" fill={accent} />
      <circle cx="65" cy="57" r="2" fill={accent} />
    </svg>
  );
}

export function IconListen() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 4v16M8 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3l4 4V4L8 8z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}

export function IconHint() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 18h6M10 21h4" />
      <path d="M8 14a5 5 0 1 1 8-4c0 2-1 3-2 4l-1 2H11l-1-2c-1-1-2-2-2-4z" />
    </svg>
  );
}

export function IconMic() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </svg>
  );
}

export function IconPause() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function IconEye() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconRepeat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function IconBolt() {
  return (
    <svg viewBox="0 0 12 16" className="h-3 w-2.5" fill="currentColor">
      <polygon points="7,0 0,9 5,9 4,16 12,7 7,7" />
    </svg>
  );
}

export function IconDot() {
  return (
    <svg viewBox="0 0 12 16" className="h-3 w-2.5" fill="currentColor">
      <circle cx="6" cy="8" r="3.4" />
    </svg>
  );
}

export function IconSlow() {
  return (
    <svg viewBox="0 0 12 16" className="h-3 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="8" r="5.2" />
      <path d="M6 4.8v3.4l2.3 1.6" strokeLinecap="round" />
    </svg>
  );
}
