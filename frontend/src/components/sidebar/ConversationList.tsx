import { useState, useMemo } from "react";
import { Search, MessageSquare } from "lucide-react";
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
        conv.lastMessagePreview?.toLowerCase().includes(query) ||
        conv.sessionId.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-white/50">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("sidebar.search")}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg
              bg-white/5 border border-white/10 text-white placeholder-white/30
              focus:border-[#3B82F6] focus:outline-none
              transition-all duration-200"
          />
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-white/40">
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
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition-all duration-200 border-l-3 border-transparent hover:border-[#3B82F6]"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={14}
                      className="text-white/40 flex-shrink-0"
                    />
                    <div className="font-medium text-sm text-white/80 truncate">
                      {conv.lastMessagePreview ||
                        `Session ${conv.sessionId.substring(0, 8)}`}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40 mt-1 ml-6">
                    <span>{conv.messageCount} 条消息</span>
                    <span>{new Date(conv.lastTime).toLocaleDateString()}</span>
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
