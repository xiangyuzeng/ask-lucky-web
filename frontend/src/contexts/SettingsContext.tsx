import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { AppSettings, SettingsContextType } from "../types/settings";
import { getSettings, setSettings } from "../utils/storage";
import { SettingsContext } from "./SettingsContextTypes";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    getSettings(),
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize settings on client side (handles migration automatically)
  useEffect(() => {
    const initialSettings = getSettings();
    setSettingsState(initialSettings);
    setIsInitialized(true);
  }, []);

  // Save settings to storage when they change
  useEffect(() => {
    if (!isInitialized) return;
    setSettings(settings);
  }, [settings, isInitialized]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleTheme = useCallback(() => {
    // Light mode only — no-op
  }, []);

  const toggleEnterBehavior = useCallback(() => {
    updateSettings({
      enterBehavior: settings.enterBehavior === "send" ? "newline" : "send",
    });
  }, [settings.enterBehavior, updateSettings]);

  const value = useMemo(
    (): SettingsContextType => ({
      settings,
      theme: "light",
      enterBehavior: settings.enterBehavior,
      toggleTheme,
      toggleEnterBehavior,
      updateSettings,
    }),
    [settings, toggleTheme, toggleEnterBehavior, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
