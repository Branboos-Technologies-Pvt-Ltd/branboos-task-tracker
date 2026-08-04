// BranBoos logo — recreated as inline SVG so it scales cleanly at any size
// and stays a single small dependency-free asset. Mirrors the rocket-in-a-
// rounded-hex-badge design with the brand rainbow gradient.

type Props = {
  size?: number;
  className?: string;
};

export function BranBoosMark({ size = 40, className }: Props) {
  const gradientId = "bb-mark-gradient";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-label="BranBoos"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="20%" stopColor="#F97316" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="60%" stopColor="#84CC16" />
          <stop offset="80%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      {/* Rounded hexagon-ish badge */}
      <path
        d="M12 6h32c3.3 0 6 2.7 6 6l6 12c1.5 3 1.5 6.5 0 9.5L50 46c-1 3-4 6-6 6H12c-3 0-6-2.7-6-6L0 33.5c-1.5-3-1.5-6.5 0-9.5L6 12c1-3 3-6 6-6z"
        transform="translate(2 4) scale(0.9)"
        fill={`url(#${gradientId})`}
      />
      {/* Rocket body */}
      <g fill="#fff" transform="translate(18 14)">
        <path d="M14 0c4 3 7 8 7 14s-3 11-7 14c-4-3-7-8-7-14s3-11 7-14z" />
        <circle cx="14" cy="12" r="3.2" fill="#fff" stroke="#0EA5E9" strokeWidth="1.5" />
        <path d="M7 20l-4 3 2 5 4-3z" />
        <path d="M21 20l4 3-2 5-4-3z" />
        <path d="M11 26l3 4 3-4-3 2z" opacity="0.8" />
      </g>
    </svg>
  );
}

export function BranBoosWordmark({
  showTagline = false,
  className,
}: {
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col leading-tight ${className ?? ""}`}>
      <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Bran<span className="text-zinc-900 dark:text-zinc-50">Boos</span>
      </span>
      <span className="h-1 w-full max-w-[8rem] rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-lime-500 via-cyan-400 to-blue-500" />
      {showTagline && (
        <span className="mt-1 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
          Technologies Pvt. Ltd.
        </span>
      )}
    </div>
  );
}

export function BranBoosLockup({
  markSize = 40,
  showTagline = false,
  className,
}: {
  markSize?: number;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <BranBoosMark size={markSize} />
      <BranBoosWordmark showTagline={showTagline} />
    </div>
  );
}
