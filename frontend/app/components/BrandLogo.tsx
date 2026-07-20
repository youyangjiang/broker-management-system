export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact-logo" : ""}`}>
      <svg viewBox="0 0 220 72" role="img" aria-label="华康医保 / HUAKAN SAÚDE">
        <g fill="#58c5bd">
          <circle cx="19" cy="19" r="9" />
          <path d="M8 35c1-9 21-9 22 0l3 25H5z" />
          <circle cx="47" cy="14" r="12" />
          <path d="M32 34c2-13 28-13 30 0l5 34H27z" />
          <circle cx="76" cy="19" r="9" />
          <path d="M65 35c1-9 21-9 22 0l3 25H62z" />
        </g>
        <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
          <path d="M14 33c0-7 10-7 10 0" />
          <path d="M41 28c0-9 13-9 13 0" />
          <path d="M71 33c0-7 10-7 10 0" />
          <path d="M24 38h7M27.5 34.5v7M55 37h8M59 33v8M81 38h7M84.5 34.5v7" />
        </g>
        <text x="100" y="36" fill="#58c5bd" fontSize="28" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">华康医保</text>
        <path d="M103 54h35M188 54h27" stroke="#58c5bd" strokeWidth="3" strokeLinecap="round" />
        <text x="144" y="59" fill="#58c5bd" fontSize="15" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="1">HUAKAN SAÚDE</text>
      </svg>
    </div>
  );
}
