import { Clock } from "lucide-react";

interface HistoryButtonProps {
  onClick: () => void;
}

export function HistoryButton({ onClick }: HistoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl bg-[var(--luckin-surface)] border border-[var(--luckin-border)] hover:bg-[var(--luckin-surface-hover)] transition-all duration-200 shadow-sm hover:shadow-md"
      aria-label="View conversation history"
    >
      <Clock className="w-5 h-5 text-[var(--luckin-text-secondary)]" />
    </button>
  );
}
