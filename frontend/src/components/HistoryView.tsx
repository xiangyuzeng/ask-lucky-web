import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, AlertCircle, Clock, ChevronRight } from "lucide-react";
import type { ConversationSummary } from "../../../shared/types";
import { getHistoriesUrl } from "../config/api";
import { useTranslation } from "../i18n";

interface HistoryViewProps {
  workingDirectory: string;
  encodedName: string | null;
  onBack: () => void;
}

export function HistoryView({ encodedName }: HistoryViewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Timeout to stop loading if encodedName never arrives
  useEffect(() => {
    if (!encodedName) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [encodedName]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!encodedName) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(getHistoriesUrl(encodedName));

        if (!response.ok) {
          // On Vercel, API may not support histories — treat as empty
          setConversations([]);
          return;
        }
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch {
        // On Vercel deployment, histories API returns stub data
        // Show empty state instead of error
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [encodedName]);

  const handleConversationSelect = (sessionId: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("sessionId", sessionId);
    navigate({ search: searchParams.toString() });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--luckin-border)] border-t-[var(--luckin-primary)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--luckin-text-secondary)]">
            {t("history.loadingConversations")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--luckin-error-bg)] rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--luckin-error)]" />
          </div>
          <h2 className="text-[var(--luckin-text-primary)] text-xl font-semibold mb-2">
            {t("history.errorTitle")}
          </h2>
          <p className="text-[var(--luckin-text-secondary)] text-sm mb-4">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--luckin-sky)] rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-[var(--luckin-text-muted)]" />
          </div>
          <h2 className="text-[var(--luckin-text-primary)] text-xl font-semibold mb-2">
            {t("history.noConversationsTitle")}
          </h2>
          <p className="text-[var(--luckin-text-secondary)] text-sm max-w-sm">
            {t("history.noConversationsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="p-6 h-full flex flex-col">
        <div className="grid gap-4 flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.sessionId}
              onClick={() => handleConversationSelect(conversation.sessionId)}
              className="p-4 bg-[var(--luckin-surface)] rounded-lg border border-[var(--luckin-border)] hover:border-[var(--luckin-primary-lighter)] transition-all duration-200 cursor-pointer shadow-luckin hover:shadow-luckin-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={14}
                      className="text-[var(--luckin-primary)] flex-shrink-0"
                    />
                    <h3 className="text-sm font-medium text-[var(--luckin-text-primary)] truncate">
                      {t("history.session")}:{" "}
                      {conversation.sessionId.substring(0, 8)}...
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--luckin-text-muted)] mt-1">
                    {new Date(conversation.startTime).toLocaleString()} •{" "}
                    {conversation.messageCount} {t("history.messages")}
                  </p>
                  <p className="text-sm text-[var(--luckin-text-secondary)] mt-2 line-clamp-2">
                    {conversation.lastMessagePreview}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-[var(--luckin-text-muted)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
