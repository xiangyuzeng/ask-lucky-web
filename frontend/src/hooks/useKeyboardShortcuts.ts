import { useCallback } from "react";
import { useLanguage } from "../i18n";

interface UseKeyboardShortcutsOptions {
  onFocusInput?: () => void;
  onNewChat?: () => void;
  onOpenExport?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { toggleLanguage } = useLanguage();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (!isMod) return;

      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          options.onFocusInput?.();
          break;
        case "n":
          e.preventDefault();
          options.onNewChat?.();
          break;
        case "e":
          e.preventDefault();
          options.onOpenExport?.();
          break;
        case "/":
          e.preventDefault();
          options.onShowHelp?.();
          break;
        case "l":
          e.preventDefault();
          toggleLanguage();
          break;
      }
    },
    [options, toggleLanguage],
  );

  return { handleKeyDown };
}
