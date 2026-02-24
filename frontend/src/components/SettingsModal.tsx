import { useEffect } from "react";
import { X } from "lucide-react";
import { GeneralSettings } from "./settings/GeneralSettings";
import { useTranslation } from "../i18n";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--luckin-surface)] rounded-xl border border-[var(--luckin-border)] shadow-luckin-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--luckin-border)] bg-luckin-gradient">
          <h2 className="text-xl font-semibold text-white">
            {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={t("settings.closeSettings")}
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <GeneralSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
