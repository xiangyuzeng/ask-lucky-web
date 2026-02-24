import { useState, useMemo } from "react";
import { useTranslation } from "../../i18n";
import type { ConversationSummary } from "../../types";

interface ConversationListProps {
  encodedName: string | null;
  conversations: ConversationSummary[];
  isLoading: boolean;
  onSelect: (sessionId: string) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  onSelect,
}: ConversationListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.title?.toLowerCase().includes(query) ||
        conv.sessionId.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-luckin-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-luckin-muted">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-luckin-light">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("sidebar.search")}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg
              bg-luckin-bg border border-luckin
              focus:border-[var(--luckin-primary)] focus:outline-none
              transition-luckin"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luckin-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-luckin-muted">
            {searchQuery
              ? t("sidebar.noResults")
              : t("sidebar.noConversations")}
          </div>
        ) : (
          <ul className="py-2">
            {filteredConversations.map((conv) => (
              <li key={conv.sessionId}>
                <button
                  onClick={() => onSelect(conv.sessionId)}
                  className="w-full px-4 py-3 text-left hover:bg-luckin-sky transition-luckin"
                >
                  <div className="font-medium text-sm text-luckin-primary truncate">
                    {conv.title || `Session ${conv.sessionId.substring(0, 8)}`}
                  </div>
                  <div className="text-xs text-luckin-muted mt-1">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
