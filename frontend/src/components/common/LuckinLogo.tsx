interface LuckinLogoProps {
  size?: number;
  className?: string;
  showPulse?: boolean;
}

export function LuckinLogo({
  size = 40,
  className = "",
  showPulse = false,
}: LuckinLogoProps) {
  return (
    <div
      role="img"
      aria-label="Luckin Logo"
      className={`inline-flex items-center justify-center rounded-full ${showPulse ? "animate-pulse-soft" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #182D71, #1E3A8A)",
        padding: size * 0.12,
        flexShrink: 0,
      }}
    >
      <img
        src="/luckin-logo.png"
        alt=""
        width={size * 0.76}
        height={size * 0.76}
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
