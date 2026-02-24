import { useLanguage } from "../../i18n";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 text-sm font-medium rounded-lg
        bg-luckin-surface border border-luckin
        hover:bg-luckin-sky transition-luckin
        focus-luckin"
      aria-label={`Switch to ${language === "en" ? "Chinese" : "English"}`}
    >
      {language === "en" ? "中文" : "EN"}
    </button>
  );
}
