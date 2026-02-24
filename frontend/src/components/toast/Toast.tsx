import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast as ToastType } from "../../contexts/ToastContext";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const typeStyles = {
  success: "bg-[var(--luckin-success)] text-white",
  error: "bg-[var(--luckin-error)] text-white",
  warning: "bg-[var(--luckin-warning)] text-white",
  info: "bg-[var(--luckin-info)] text-white",
};

const typeIcons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 150);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-luckin-lg
        transform transition-all duration-150
        ${typeStyles[toast.type]}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      role="alert"
    >
      <span className="flex-shrink-0">{typeIcons[toast.type]}</span>
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
