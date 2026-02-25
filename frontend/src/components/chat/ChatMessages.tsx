import { useRef, useEffect } from "react";
import type { ComponentType } from "react";
import type { AllMessage } from "../../types";
import {
  isChatMessage,
  isSystemMessage,
  isToolMessage,
  isToolResultMessage,
  isPlanMessage,
  isThinkingMessage,
  isTodoMessage,
} from "../../types";
import {
  ChatMessageComponent,
  SystemMessageComponent,
  ToolMessageComponent,
  ToolResultMessageComponent,
  PlanMessageComponent,
  ThinkingMessageComponent,
  TodoMessageComponent,
  LoadingComponent,
} from "../MessageComponents";
import { useTranslation } from "../../i18n";
import { useDepartment } from "../../contexts/DepartmentContext";
import { departments } from "../../data/departments";
import { DepartmentQuickActions } from "./DepartmentQuickActions";
import { LuckinLogo } from "../common/LuckinLogo";
import { MessageSquare, FileText, Lightbulb } from "lucide-react";

interface ChatMessagesProps {
  messages: AllMessage[];
  isLoading: boolean;
  onQuickAction?: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onQuickAction,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: AllMessage, index: number) => {
    // Use timestamp as key for stable rendering, fallback to index if needed
    const key = `${message.timestamp}-${index}`;

    if (isSystemMessage(message)) {
      return <SystemMessageComponent key={key} message={message} />;
    } else if (isToolMessage(message)) {
      return <ToolMessageComponent key={key} message={message} />;
    } else if (isToolResultMessage(message)) {
      return <ToolResultMessageComponent key={key} message={message} />;
    } else if (isPlanMessage(message)) {
      return <PlanMessageComponent key={key} message={message} />;
    } else if (isThinkingMessage(message)) {
      return <ThinkingMessageComponent key={key} message={message} />;
    } else if (isTodoMessage(message)) {
      return <TodoMessageComponent key={key} message={message} />;
    } else if (isChatMessage(message)) {
      return <ChatMessageComponent key={key} message={message} />;
    }
    return null;
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-6 mb-3 sm:mb-6 flex flex-col"
    >
      {messages.length === 0 ? (
        <EmptyState onQuickAction={onQuickAction} />
      ) : (
        <>
          {/* Spacer div to push messages to the bottom */}
          <div className="flex-1" aria-hidden="true"></div>
          {messages.map(renderMessage)}
          {isLoading && <LoadingComponent />}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

interface EmptyStateProps {
  onQuickAction?: (prompt: string) => void;
}

function EmptyState({ onQuickAction }: EmptyStateProps) {
  const { t } = useTranslation();
  const { department } = useDepartment();

  const currentDept = departments[department];
  const isDepartmentSelected = department !== "general";

  const DeptIcon: ComponentType<{ className?: string; size?: number }> =
    currentDept.icon;

  const tipCards = [
    {
      icon: MessageSquare,
      title: t("chat.emptyState.tip1Title"),
      desc: t("chat.emptyState.tip1Desc"),
    },
    {
      icon: FileText,
      title: t("chat.emptyState.tip2Title"),
      desc: t("chat.emptyState.tip2Desc"),
    },
    {
      icon: Lightbulb,
      title: t("chat.emptyState.tip3Title"),
      desc: t("chat.emptyState.tip3Desc"),
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-2xl w-full px-4">
        {/* Logo + Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LuckinLogo size={64} />
          </div>
          {isDepartmentSelected ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <DeptIcon size={20} className="text-[var(--luckin-primary)]" />
                <h2 className="text-xl font-bold text-[var(--luckin-text-primary)]">
                  {t(`departments.${department}.name`)}
                </h2>
              </div>
              <p className="text-sm text-[var(--luckin-text-secondary)] mb-1">
                {t(`departments.${department}.description`)}
              </p>
              <p className="text-sm text-[var(--luckin-text-muted)]">
                {t("chat.emptyState.deptWelcome")}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[var(--luckin-text-primary)] mb-2">
                {t("chat.emptyState.title")}
              </h2>
              <p className="text-sm text-[var(--luckin-text-secondary)] max-w-md mx-auto">
                {t("chat.emptyState.welcomeDesc")}
              </p>
            </>
          )}
        </div>

        {/* Quick Actions (department-specific) */}
        {isDepartmentSelected && onQuickAction && (
          <div className="mb-8">
            <DepartmentQuickActions onActionClick={onQuickAction} />
          </div>
        )}

        {/* Capability Tip Cards */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[var(--luckin-text-muted)] uppercase tracking-wider text-center mb-4">
            {t("chat.emptyState.capabilities")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tipCards.map((tip, i) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[var(--luckin-border)] bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      background: "rgba(24, 45, 113, 0.08)",
                    }}
                  >
                    <TipIcon
                      size={18}
                      className="text-[var(--luckin-primary)]"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--luckin-text-primary)] mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-[var(--luckin-text-muted)] leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-[var(--luckin-text-muted)]">
          {t("chat.emptyState.subtitle")}
        </p>
      </div>
    </div>
  );
}
