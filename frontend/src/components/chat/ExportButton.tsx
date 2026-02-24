import { useTranslation } from "../../i18n";

interface ExportButtonProps {
  onClick: () => void;
}

export function ExportButton({ onClick }: ExportButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-luckin-surface border border-luckin
        hover:bg-luckin-sky transition-luckin focus-luckin"
      aria-label={t("export.title")}
      title={t("export.title")}
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    </button>
  );
}
