export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact-logo" : ""}`}>
      <img src="/brand/huakan-logo-v2.png" alt="华康医保 / HUAKAN SAÚDE" />
    </div>
  );
}
