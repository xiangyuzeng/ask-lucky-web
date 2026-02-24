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
import { MessageSquare } from "lucide-react";

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

  return (
    <div className="flex-1 flex items-center justify-center text-center text-[var(--luckin-text-secondary)]">
      <div>
        {isDepartmentSelected ? (
          <>
            {/* Department-specific welcome */}
            <div className="mb-6 flex justify-center" style={{ opacity: 0.8 }}>
              <DeptIcon
                size={48}
                className="text-[var(--luckin-text-secondary)]"
              />
            </div>
            <p className="text-lg font-bold text-[var(--luckin-text-primary)]">
              {t(`departments.${department}.name`)}
            </p>
            <p className="text-sm mt-2 text-[var(--luckin-text-muted)]">
              {t(`departments.${department}.description`)}
            </p>
            {onQuickAction && (
              <DepartmentQuickActions onActionClick={onQuickAction} />
            )}
          </>
        ) : (
          <>
            {/* Generic welcome */}
            <div className="mb-6 flex justify-center opacity-60">
              <MessageSquare
                size={48}
                className="text-[var(--luckin-text-secondary)]"
              />
            </div>
            <p className="text-lg font-medium text-[var(--luckin-text-primary)]">
              {t("chat.emptyState.title")}
            </p>
            <p className="text-sm mt-2 text-[var(--luckin-text-muted)]">
              {t("chat.emptyState.subtitle")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
