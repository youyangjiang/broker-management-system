export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact-logo" : ""}`}>
      <svg viewBox="0 0 380 118" role="img" aria-label="华康医保 / HUAKAN SAUDE">
        <g transform="translate(8 18)">
          <g fill="#58c5bd">
            <circle cx="23" cy="22" r="14" />
            <path d="M5 52c2-20 34-20 38 0l7 48H0z" />
            <circle cx="68" cy="14" r="18" />
            <path d="M43 51c4-30 47-30 51 0l10 58H33z" />
            <circle cx="112" cy="22" r="14" />
            <path d="M94 52c3-20 36-20 39 0l7 48H89z" />
          </g>
          <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M15 49c0-12 17-12 17 0" />
            <path d="M57 41c0-15 23-15 23 0" />
            <path d="M104 49c0-12 17-12 17 0" />
            <path d="M34 59h17M42.5 50.5v17M83 57h20M93 47v20M123 59h17M131.5 50.5v17" />
          </g>
        </g>
        <text x="158" y="55" fill="#58c5bd" fontSize="42" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">华康医保</text>
        <path d="M160 82h48M330 82h38" stroke="#58c5bd" strokeWidth="5" strokeLinecap="round" />
        <text x="218" y="90" fill="#58c5bd" fontSize="22" fontFamily="Arial, Helvetica, sans-serif">HUAKAN SAUDE</text>
      </svg>
    </div>
  );
}
