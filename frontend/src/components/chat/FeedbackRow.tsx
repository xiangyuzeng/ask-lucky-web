import { useFeedback } from "../../contexts/FeedbackContext";
import { useTranslation } from "../../i18n";
import type { FeedbackTag } from "../../types/feedback";

interface FeedbackRowProps {
  messageId: string;
}

const positiveTags: FeedbackTag[] = ["accurate", "clear", "actionable"];
const negativeTags: FeedbackTag[] = ["incomplete", "incorrect", "confusing"];

export function FeedbackRow({ messageId }: FeedbackRowProps) {
  const { getFeedback, setRating, toggleTag } = useFeedback();
  const { t } = useTranslation();

  const feedback = getFeedback(messageId);
  const rating = feedback?.rating;
  const tags = feedback?.tags || [];

  const showTags = rating !== null;
  const availableTags = rating === "positive" ? positiveTags : negativeTags;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-luckin-light">
      {/* Rating buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setRating(messageId, "positive")}
          className={`p-1.5 rounded-lg transition-luckin ${
            rating === "positive"
              ? "bg-luckin-success text-white"
              : "text-luckin-muted hover:bg-luckin-sky"
          }`}
          aria-label={t("feedback.helpful")}
          title={t("feedback.helpful")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
        <button
          onClick={() => setRating(messageId, "negative")}
          className={`p-1.5 rounded-lg transition-luckin ${
            rating === "negative"
              ? "bg-luckin-error text-white"
              : "text-luckin-muted hover:bg-luckin-sky"
          }`}
          aria-label={t("feedback.notHelpful")}
          title={t("feedback.notHelpful")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            />
          </svg>
        </button>
      </div>

      {/* Tag chips */}
      {showTags && (
        <div className="flex flex-wrap gap-1">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(messageId, tag)}
              className={`px-2 py-0.5 text-xs rounded-full transition-luckin ${
                tags.includes(tag)
                  ? "bg-luckin-primary text-white"
                  : "bg-luckin-sky text-luckin-secondary hover:bg-luckin-primary hover:text-white"
              }`}
            >
              {t(`feedback.tags.${tag}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
