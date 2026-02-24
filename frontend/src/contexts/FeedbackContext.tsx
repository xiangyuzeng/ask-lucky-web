import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { FeedbackItem, FeedbackTag } from "../types/feedback";

interface FeedbackContextType {
  feedback: Map<string, FeedbackItem>;
  setRating: (messageId: string, rating: "positive" | "negative") => void;
  toggleTag: (messageId: string, tag: FeedbackTag) => void;
  getFeedback: (messageId: string) => FeedbackItem | undefined;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined,
);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<Map<string, FeedbackItem>>(
    new Map(),
  );

  const setRating = useCallback(
    (messageId: string, rating: "positive" | "negative") => {
      setFeedback((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(messageId);
        newMap.set(messageId, {
          messageId,
          rating: existing?.rating === rating ? null : rating,
          tags: existing?.tags || [],
          timestamp: Date.now(),
        });
        return newMap;
      });
    },
    [],
  );

  const toggleTag = useCallback((messageId: string, tag: FeedbackTag) => {
    setFeedback((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(messageId);
      const currentTags = existing?.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      newMap.set(messageId, {
        messageId,
        rating: existing?.rating || null,
        tags: newTags,
        timestamp: Date.now(),
      });
      return newMap;
    });
  }, []);

  const getFeedback = useCallback(
    (messageId: string) => {
      return feedback.get(messageId);
    },
    [feedback],
  );

  return (
    <FeedbackContext.Provider
      value={{ feedback, setRating, toggleTag, getFeedback }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
