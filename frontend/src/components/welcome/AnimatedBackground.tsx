interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Animated gradient mesh layer */}
      <div
        className="absolute inset-0 animate-gradient-bg"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(24, 45, 113, 0.05) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 80% at 80% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 70%)",
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(232, 240, 254, 0.30) 0%, transparent 80%)",
            "linear-gradient(135deg, #F0F4F8 0%, #F0F4F8 100%)",
          ].join(", "),
          backgroundSize: "400% 400%",
        }}
        aria-hidden="true"
      />

      {/* Dot-grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(24, 45, 113, 0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
