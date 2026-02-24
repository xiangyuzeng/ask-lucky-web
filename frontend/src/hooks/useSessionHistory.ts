import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "luckin-ops-session-history";
const MAX_HISTORY = 10;

interface SessionHistoryState {
  history: string[];
  currentIndex: number;
}

export function useSessionHistory(currentSessionId: string | null) {
  const [state, setState] = useState<SessionHistoryState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { history: [], currentIndex: -1 };
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Add session to history when it changes
  useEffect(() => {
    if (!currentSessionId) return;

    setState((prev) => {
      // Don't add if it's already the current session
      if (prev.history[prev.currentIndex] === currentSessionId) {
        return prev;
      }

      // Check if session already exists in history
      const existingIndex = prev.history.indexOf(currentSessionId);
      if (existingIndex !== -1) {
        // Move to existing session
        return { ...prev, currentIndex: existingIndex };
      }

      // Add new session to history
      const newHistory = [...prev.history, currentSessionId].slice(
        -MAX_HISTORY,
      );
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  }, [currentSessionId]);

  const previousSessionId =
    state.currentIndex > 0 ? state.history[state.currentIndex - 1] : null;

  const canGoBack = previousSessionId !== null;

  const goBack = useCallback(() => {
    if (!canGoBack) return null;

    setState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex - 1,
    }));

    return previousSessionId;
  }, [canGoBack, previousSessionId]);

  const clearHistory = useCallback(() => {
    setState({ history: [], currentIndex: -1 });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    previousSessionId,
    canGoBack,
    goBack,
    clearHistory,
    historyLength: state.history.length,
  };
}
