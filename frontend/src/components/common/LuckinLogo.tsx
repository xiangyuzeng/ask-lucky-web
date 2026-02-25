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
    <img
      role="img"
      aria-label="Luckin Logo"
      src="/luckin-deer.svg"
      alt=""
      width={size}
      height={size}
      className={`${showPulse ? "animate-pulse-soft" : ""} ${className}`}
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        objectFit: "contain",
      }}
      draggable={false}
    />
  );
}
