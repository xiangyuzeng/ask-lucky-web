import { useEffect, useCallback } from "react";
import { useLanguage } from "../../i18n";

interface KeyboardShortcutsProps {
  onFocusInput?: () => void;
  onNewChat?: () => void;
  onOpenExport?: () => void;
  onShowHelp?: () => void;
}

export function KeyboardShortcuts({
  onFocusInput,
  onNewChat,
  onOpenExport,
  onShowHelp,
}: KeyboardShortcutsProps) {
  const { toggleLanguage } = useLanguage();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (!isMod) return;

      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          onFocusInput?.();
          break;
        case "n":
          e.preventDefault();
          onNewChat?.();
          break;
        case "e":
          e.preventDefault();
          onOpenExport?.();
          break;
        case "/":
          e.preventDefault();
          onShowHelp?.();
          break;
        case "l":
          e.preventDefault();
          toggleLanguage();
          break;
      }
    },
    [onFocusInput, onNewChat, onOpenExport, onShowHelp, toggleLanguage],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
