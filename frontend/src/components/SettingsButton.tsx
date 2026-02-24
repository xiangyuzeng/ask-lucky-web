import { Settings } from "lucide-react";

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl bg-[var(--luckin-surface)] border border-[var(--luckin-border)] hover:bg-[var(--luckin-surface-hover)] transition-all duration-300 shadow-luckin hover:shadow-luckin-md group"
      aria-label="Open settings"
    >
      <Settings className="w-5 h-5 text-[var(--luckin-text-secondary)] transition-transform duration-300 group-hover:rotate-90" />
    </button>
  );
}
