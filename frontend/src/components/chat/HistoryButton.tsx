import { Clock } from "lucide-react";

interface HistoryButtonProps {
  onClick: () => void;
}

export function HistoryButton({ onClick }: HistoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200"
      aria-label="View conversation history"
    >
      <Clock className="w-5 h-5 text-white/80" />
    </button>
  );
}
