export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact-logo" : ""}`}>
      <img src="/brand/huakan-logo.png" alt="华康医护 / HUAKAN SAÚDE" />
    </div>
  );
}
