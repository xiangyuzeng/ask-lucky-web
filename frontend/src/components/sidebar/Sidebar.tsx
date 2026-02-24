import { useState, useCallback } from "react";
import { Sparkles, MessageSquare, FileText, X } from "lucide-react";
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
          w-80 sidebar-dark
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"}
          flex flex-col
        `}
        aria-label="Sidebar"
      >
        {/* Branding */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-luckin-gradient flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">
              Ask Lucky
            </span>
          </div>

          {/* New Chat button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-luckin-gradient text-white text-sm font-medium rounded-xl transition-all duration-200 hover:opacity-90 press-effect">
            <Sparkles size={16} />
            {t("sidebar.newChat")}
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 px-4 py-2">
          <button
            onClick={() => setActiveTab("conversations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
              ${
                activeTab === "conversations"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70 hover:bg-white/5"
              }`}
          >
            <MessageSquare size={14} />
            {t("sidebar.conversations")}
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
              ${
                activeTab === "templates"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70 hover:bg-white/5"
              }`}
          >
            <FileText size={14} />
            {t("sidebar.templates")}
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
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
