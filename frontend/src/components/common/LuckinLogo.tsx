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
      className={`inline-flex items-center justify-center rounded-full overflow-hidden ${showPulse ? "animate-pulse-soft" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "#0A3A7A",
        flexShrink: 0,
      }}
    >
      <img
        src="/luckin-logo.png"
        alt=""
        width={size * 0.82}
        height={size * 0.82}
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
