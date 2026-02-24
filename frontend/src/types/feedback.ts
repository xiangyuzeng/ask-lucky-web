export interface FeedbackItem {
  messageId: string;
  rating: "positive" | "negative" | null;
  tags: string[];
  timestamp: number;
}

export type FeedbackTag =
  | "accurate"
  | "clear"
  | "actionable"
  | "incomplete"
  | "incorrect"
  | "confusing";
