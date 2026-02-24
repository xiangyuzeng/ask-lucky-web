import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import en from "./en.json";
import zh from "./zh.json";

export type Language = "en" | "zh";

type TranslationValue = string | Record<string, unknown>;
type Translations = Record<string, TranslationValue>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  translations: Translations;
}

const translations: Record<Language, Translations> = {
  en: en as Translations,
  zh: zh as Translations,
};

const STORAGE_KEY = "luckin-ops-language";

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      return stored;
    }
    return "zh";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
