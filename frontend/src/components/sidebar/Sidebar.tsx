import { useState, useCallback } from "react";
import { useTranslation } from "../../i18n";
import { ConversationList } from "./ConversationList";
import { PromptTemplates } from "./PromptTemplates";
import type { ConversationSummary } from "../../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  encodedName: string | null;
  onSelectConversation: (sessionId: string) => void;
  onSelectTemplate: (prompt: string) => void;
  conversations?: ConversationSummary[];
  isLoadingConversations?: boolean;
}

type SidebarTab = "conversations" | "templates";

export function Sidebar({
  isOpen,
  onClose,
  encodedName,
  onSelectConversation,
  onSelectTemplate,
  conversations = [],
  isLoadingConversations = false,
}: SidebarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SidebarTab>("conversations");

  const handleConversationSelect = useCallback(
    (sessionId: string) => {
      onSelectConversation(sessionId);
      onClose();
    },
    [onSelectConversation, onClose],
  );

  const handleTemplateSelect = useCallback(
    (prompt: string) => {
      onSelectTemplate(prompt);
      onClose();
    },
    [onSelectTemplate, onClose],
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-80 bg-luckin-surface border-r border-luckin
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"}
          flex flex-col
        `}
        aria-label="Sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-luckin">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-luckin
                ${
                  activeTab === "conversations"
                    ? "bg-luckin-primary text-white"
                    : "text-luckin-secondary hover:bg-luckin-sky"
                }`}
            >
              {t("sidebar.conversations")}
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-luckin
                ${
                  activeTab === "templates"
                    ? "bg-luckin-primary text-white"
                    : "text-luckin-secondary hover:bg-luckin-sky"
                }`}
            >
              {t("sidebar.templates")}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-luckin-sky transition-luckin lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5 text-luckin-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? (
            <ConversationList
              encodedName={encodedName}
              conversations={conversations}
              isLoading={isLoadingConversations}
              onSelect={handleConversationSelect}
            />
          ) : (
            <PromptTemplates onSelect={handleTemplateSelect} />
          )}
        </div>
      </aside>
    </>
  );
}
