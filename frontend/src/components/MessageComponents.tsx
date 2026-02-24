import {
  Settings,
  Wrench,
  CheckCircle,
  Brain,
  ListTodo,
  Map,
  CircleCheckBig,
  LoaderCircle,
  Circle,
} from "lucide-react";
import type {
  ChatMessage,
  SystemMessage,
  ToolMessage,
  ToolResultMessage,
  PlanMessage,
  ThinkingMessage,
  TodoMessage,
  TodoItem,
  HooksMessage,
} from "../types";
import { useTranslation } from "../i18n";
import { TimestampComponent } from "./TimestampComponent";
import { MessageContainer } from "./messages/MessageContainer";
import { CollapsibleDetails } from "./messages/CollapsibleDetails";
import { MESSAGE_CONSTANTS } from "../utils/constants";
import {
  createEditResult,
  createBashPreview,
  createContentPreview,
  isEditToolUseResult,
  isBashToolUseResult,
} from "../utils/contentUtils";

// ANSI escape sequence regex for cleaning hooks messages
const ANSI_REGEX = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

// Type guard to check if the message is a hooks message
function isHooksMessage(
  msg: SystemMessage,
): msg is HooksMessage & { timestamp: number } {
  return (
    msg.type === "system" &&
    "content" in msg &&
    typeof msg.content === "string" &&
    !("subtype" in msg)
  );
}

interface ChatMessageComponentProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageComponentProps) {
  const isUser = message.role === "user";
  const colorScheme = isUser
    ? "bubble-user bg-[var(--luckin-primary)] text-[var(--luckin-text-inverse)]"
    : "bubble-assistant bg-[var(--luckin-surface)] border-l-[3px] border-[var(--luckin-primary)] shadow-luckin";

  const animationStyle = isUser
    ? { animation: "fadeSlideInRight 0.3s ease-out forwards" }
    : { animation: "fadeSlideInLeft 0.3s ease-out forwards" };

  return (
    <MessageContainer
      alignment={isUser ? "right" : "left"}
      colorScheme={colorScheme}
    >
      <div style={animationStyle}>
        <div className="mb-2 flex items-center justify-between gap-4">
          <div
            className={`text-xs font-semibold opacity-90 ${
              isUser
                ? "text-[var(--luckin-text-inverse)]"
                : "text-[var(--luckin-text-secondary)]"
            }`}
          >
            {isUser ? "\u7528\u6237" : "Lucky"}
          </div>
          <TimestampComponent
            timestamp={message.timestamp}
            className={`text-xs opacity-70 ${
              isUser
                ? "text-[var(--luckin-text-inverse)]"
                : "text-[var(--luckin-text-muted)]"
            }`}
          />
        </div>
        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
          {message.content}
        </pre>
      </div>
    </MessageContainer>
  );
}

interface SystemMessageComponentProps {
  message: SystemMessage;
}

export function SystemMessageComponent({
  message,
}: SystemMessageComponentProps) {
  // Generate details based on message type and subtype
  const getDetails = () => {
    if (
      message.type === "system" &&
      "subtype" in message &&
      message.subtype === "init"
    ) {
      return [
        `Model: ${message.model}`,
        `Session: ${message.session_id.substring(0, MESSAGE_CONSTANTS.SESSION_ID_DISPLAY_LENGTH)}`,
        `Tools: ${message.tools.length} available`,
        `CWD: ${message.cwd}`,
        `Permission Mode: ${message.permissionMode}`,
        `API Key Source: ${message.apiKeySource}`,
      ].join("\n");
    } else if (message.type === "result") {
      const details = [
        `Duration: ${message.duration_ms}ms`,
        `Cost: $${message.total_cost_usd.toFixed(4)}`,
        `Tokens: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`,
      ];
      return details.join("\n");
    } else if (message.type === "error") {
      return message.message;
    } else if (isHooksMessage(message)) {
      // This is a hooks message - show only the content
      // Remove ANSI escape sequences for cleaner display
      return message.content.replace(ANSI_REGEX, "");
    }
    return JSON.stringify(message, null, 2);
  };

  // Get label based on message type
  const getLabel = () => {
    if (message.type === "system") return "System";
    if (message.type === "result") return "Result";
    if (message.type === "error") return "Error";
    return "Message";
  };

  const details = getDetails();

  return (
    <CollapsibleDetails
      label={getLabel()}
      details={details}
      badge={"subtype" in message ? message.subtype : undefined}
      icon={
        <span className="bg-[var(--luckin-primary)]">
          <Settings size={10} color="white" />
        </span>
      }
      colorScheme={{
        header: "text-[var(--luckin-primary)]",
        content: "text-[var(--luckin-primary)]",
        border: "border-[var(--luckin-primary)]/20",
        bg: "bg-luckin-sky border border-[var(--luckin-primary)]/20",
      }}
    />
  );
}

interface ToolMessageComponentProps {
  message: ToolMessage;
}

export function ToolMessageComponent({ message }: ToolMessageComponentProps) {
  return (
    <MessageContainer
      alignment="left"
      colorScheme="bg-[var(--luckin-success-bg)] text-[var(--luckin-success)]"
    >
      <div className="text-xs font-semibold mb-2 opacity-90 text-[var(--luckin-success)] flex items-center gap-2">
        <div className="w-4 h-4 bg-[var(--luckin-success)] rounded-full flex items-center justify-center">
          <Wrench size={10} color="white" />
        </div>
        {message.content}
      </div>
    </MessageContainer>
  );
}

interface ToolResultMessageComponentProps {
  message: ToolResultMessage;
}

export function ToolResultMessageComponent({
  message,
}: ToolResultMessageComponentProps) {
  const toolUseResult = message.toolUseResult;

  let previewContent: string | undefined;
  let previewSummary: string | undefined;
  let maxPreviewLines = 5;
  let displayContent = message.content;
  let defaultExpanded = false;

  // Handle Edit tool results with structuredPatch
  if (message.toolName === "Edit" && isEditToolUseResult(toolUseResult)) {
    const editResult = createEditResult(
      toolUseResult.structuredPatch,
      message.content,
      20, // autoExpandThreshold: auto-expand if 20 lines or fewer
    );
    displayContent = editResult.details;
    previewSummary = editResult.summary;
    previewContent = editResult.previewContent;
    defaultExpanded = editResult.defaultExpanded;
    maxPreviewLines = 20; // Use 20 for Edit results to match previewContent
  }

  // Handle Bash tool results with stdout/stderr
  else if (message.toolName === "Bash" && isBashToolUseResult(toolUseResult)) {
    const isError = Boolean(toolUseResult.stderr?.trim());
    const bashPreview = createBashPreview(
      toolUseResult.stdout || "",
      toolUseResult.stderr || "",
      isError,
      5,
    );
    if (bashPreview.hasMore) {
      previewContent = bashPreview.preview;
    }
  }

  // Handle specific tool results that benefit from content preview
  // Note: Read tool should NOT show preview, only line counts in summary
  else if (message.toolName === "Grep" && message.content.trim().length > 0) {
    const contentPreview = createContentPreview(message.content, 5);
    if (contentPreview.hasMore) {
      previewContent = contentPreview.preview;
    }
  }

  // Determine if preview should be shown for this tool
  const shouldShowPreview =
    message.toolName === "Bash" ||
    message.toolName === "Edit" ||
    message.toolName === "Grep";

  return (
    <CollapsibleDetails
      label={message.toolName}
      details={displayContent}
      badge={message.toolName === "Edit" ? undefined : message.summary}
      icon={
        <span className="bg-[var(--luckin-success)]">
          <CheckCircle size={10} color="white" />
        </span>
      }
      colorScheme={{
        header: "text-[var(--luckin-success)]",
        content: "text-[var(--luckin-success)]",
        border: "border-[var(--luckin-success)]/20",
        bg: "bg-[var(--luckin-success-bg)] border border-[var(--luckin-success)]/20",
      }}
      previewContent={previewContent}
      previewSummary={previewSummary}
      maxPreviewLines={maxPreviewLines}
      showPreview={shouldShowPreview}
      defaultExpanded={defaultExpanded}
    />
  );
}

interface PlanMessageComponentProps {
  message: PlanMessage;
}

export function PlanMessageComponent({ message }: PlanMessageComponentProps) {
  return (
    <MessageContainer
      alignment="left"
      colorScheme="bg-[var(--luckin-sky)] text-[var(--luckin-primary)]"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold opacity-90 text-[var(--luckin-primary)] flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--luckin-primary)] rounded-full flex items-center justify-center">
            <Map size={10} color="white" />
          </div>
          Ready to code?
        </div>
        <TimestampComponent
          timestamp={message.timestamp}
          className="text-xs opacity-70 text-[var(--luckin-primary)]"
        />
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-[var(--luckin-primary)] mb-2">
          Here is Lucky's plan:
        </p>
        <div className="bg-[var(--luckin-primary)]/5 border border-[var(--luckin-primary)]/20 rounded-lg p-3">
          <pre className="text-sm text-[var(--luckin-primary)] whitespace-pre-wrap font-mono leading-relaxed">
            {message.plan}
          </pre>
        </div>
      </div>
    </MessageContainer>
  );
}

interface ThinkingMessageComponentProps {
  message: ThinkingMessage;
}

export function ThinkingMessageComponent({
  message,
}: ThinkingMessageComponentProps) {
  return (
    <CollapsibleDetails
      label="Lucky's Reasoning"
      details={message.content}
      badge="thinking"
      icon={
        <span className="bg-[#3730A3]">
          <Brain size={10} color="white" />
        </span>
      }
      colorScheme={{
        header: "text-[#3730A3]",
        content: "text-[#3730A3] italic",
        border: "border-[#3730A3]/20",
        bg: "bg-[#EEF2FF] border border-[#3730A3]/20",
      }}
      defaultExpanded={true}
    />
  );
}

interface TodoMessageComponentProps {
  message: TodoMessage;
}

export function TodoMessageComponent({ message }: TodoMessageComponentProps) {
  const { t } = useTranslation();
  const getStatusIcon = (status: TodoItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          icon: (
            <CircleCheckBig
              size={16}
              className="text-[var(--luckin-success)]"
            />
          ),
          label: "Completed",
        };
      case "in_progress":
        return {
          icon: (
            <LoaderCircle
              size={16}
              className="text-[var(--luckin-primary)] animate-spin-slow"
            />
          ),
          label: t("messages.inProgress"),
        };
      case "pending":
      default:
        return {
          icon: (
            <Circle size={16} className="text-[var(--luckin-text-muted)]" />
          ),
          label: "Pending",
        };
    }
  };

  const getStatusColor = (status: TodoItem["status"]) => {
    switch (status) {
      case "completed":
        return "text-[var(--luckin-success)]";
      case "in_progress":
        return "text-[var(--luckin-primary)]";
      case "pending":
      default:
        return "text-[var(--luckin-text-muted)]";
    }
  };

  return (
    <MessageContainer
      alignment="left"
      colorScheme="bg-[var(--luckin-accent-light)] text-[#92600A]"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold opacity-90 text-[#92600A] flex items-center gap-2">
          <div
            className="w-4 h-4 bg-[var(--luckin-warning)] rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <ListTodo size={10} color="white" />
          </div>
          {t("messages.todoListUpdated")}
        </div>
        <TimestampComponent
          timestamp={message.timestamp}
          className="text-xs opacity-70 text-[#92600A]"
        />
      </div>

      <div className="space-y-1">
        {message.todos.map((todo, index) => {
          const statusIcon = getStatusIcon(todo.status);
          return (
            <div key={index} className="flex items-start gap-2">
              <span
                className="flex-shrink-0 mt-0.5"
                aria-label={statusIcon.label}
              >
                {statusIcon.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${getStatusColor(todo.status)}`}>
                  {todo.content}
                </div>
                {todo.status === "in_progress" && (
                  <div className="text-xs text-[#92600A]/70 italic">
                    {todo.activeForm}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-[#92600A]/80">
        {message.todos.filter((t) => t.status === "completed").length} of{" "}
        {message.todos.length} completed
      </div>
    </MessageContainer>
  );
}

export function LoadingComponent() {
  return (
    <MessageContainer
      alignment="left"
      colorScheme="bg-[var(--luckin-surface)] shadow-luckin"
    >
      <div className="text-xs font-semibold mb-2 opacity-90 text-[var(--luckin-text-secondary)]">
        Lucky
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-[var(--luckin-primary)]"
            style={{ animation: "waveDots 1.2s ease-in-out infinite" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--luckin-primary)]"
            style={{
              animation: "waveDots 1.2s ease-in-out infinite",
              animationDelay: "0.15s",
            }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--luckin-primary)]"
            style={{
              animation: "waveDots 1.2s ease-in-out infinite",
              animationDelay: "0.3s",
            }}
          />
        </div>
        <span className="text-luckin-muted">
          Lucky {"\u601D\u8003\u4E2D"}...
        </span>
      </div>
    </MessageContainer>
  );
}
