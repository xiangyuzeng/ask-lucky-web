import { useState } from "react";
import { useTranslation } from "../../i18n";
import type { ChatMessage } from "../../types";
import {
  exportToPDF,
  exportToMarkdown,
  exportToSlack,
  downloadFile,
} from "../../utils/exportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  title?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  messages,
  title = "Conversation",
}: ExportModalProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(messages, title);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleExportMarkdown = () => {
    const markdown = exportToMarkdown(messages, title);
    downloadFile(
      markdown,
      `${title.replace(/\s+/g, "_")}_${Date.now()}.md`,
      "text/markdown",
    );
    onClose();
  };

  const handleCopySlack = async () => {
    const slack = exportToSlack(messages);
    await navigator.clipboard.writeText(slack);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-luckin-surface rounded-xl shadow-luckin-lg p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-luckin-primary mb-4">
          {t("export.title")}
        </h2>

        <div className="space-y-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-luckin-bg hover:bg-luckin-sky transition-luckin
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5 text-luckin-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-luckin-primary">{t("export.pdf")}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-luckin-bg hover:bg-luckin-sky transition-luckin"
          >
            <svg
              className="w-5 h-5 text-luckin-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-luckin-primary">{t("export.markdown")}</span>
          </button>

          <button
            onClick={handleCopySlack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              bg-luckin-bg hover:bg-luckin-sky transition-luckin"
          >
            <svg
              className="w-5 h-5 text-luckin-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-luckin-primary">{t("export.slack")}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-luckin-muted hover:text-luckin-primary transition-luckin"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
