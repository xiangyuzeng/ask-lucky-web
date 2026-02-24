import React, { useRef, useEffect, useState } from "react";
import {
  SendHorizontal,
  Square,
  Wrench,
  Pause,
  FastForward,
} from "lucide-react";
import { UI_CONSTANTS, KEYBOARD_SHORTCUTS } from "../../utils/constants";
import { useEnterBehavior } from "../../hooks/useSettings";
import { PermissionInputPanel } from "./PermissionInputPanel";
import { PlanPermissionInputPanel } from "./PlanPermissionInputPanel";
import { useTranslation } from "../../i18n";
import type { PermissionMode } from "../../types";

interface PermissionData {
  patterns: string[];
  onAllow: () => void;
  onAllowPermanent: () => void;
  onDeny: () => void;
  getButtonClassName?: (
    buttonType: "allow" | "allowPermanent" | "deny",
    defaultClassName: string,
  ) => string;
  onSelectionChange?: (selection: "allow" | "allowPermanent" | "deny") => void;
  externalSelectedOption?: "allow" | "allowPermanent" | "deny" | null;
}

interface PlanPermissionData {
  onAcceptWithEdits: () => void;
  onAcceptDefault: () => void;
  onKeepPlanning: () => void;
  getButtonClassName?: (
    buttonType: "acceptWithEdits" | "acceptDefault" | "keepPlanning",
    defaultClassName: string,
  ) => string;
  onSelectionChange?: (
    selection: "acceptWithEdits" | "acceptDefault" | "keepPlanning",
  ) => void;
  externalSelectedOption?:
    | "acceptWithEdits"
    | "acceptDefault"
    | "keepPlanning"
    | null;
}

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  currentRequestId: string | null;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  // Permission mode props
  permissionMode: PermissionMode;
  onPermissionModeChange: (mode: PermissionMode) => void;
  showPermissions?: boolean;
  permissionData?: PermissionData;
  planPermissionData?: PlanPermissionData;
}

export function ChatInput({
  input,
  isLoading,
  currentRequestId,
  onInputChange,
  onSubmit,
  onAbort,
  permissionMode,
  onPermissionModeChange,
  showPermissions = false,
  permissionData,
  planPermissionData,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const { enterBehavior } = useEnterBehavior();
  const { t } = useTranslation();

  // Focus input when not loading and not in permission mode
  useEffect(() => {
    if (!isLoading && !showPermissions && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, showPermissions]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const computedStyle = getComputedStyle(textarea);
      const maxHeight =
        parseInt(computedStyle.maxHeight, 10) ||
        UI_CONSTANTS.TEXTAREA_MAX_HEIGHT;
      const scrollHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Permission mode toggle: Ctrl+Shift+M (all platforms)
    if (
      e.key === KEYBOARD_SHORTCUTS.PERMISSION_MODE_TOGGLE &&
      e.shiftKey &&
      e.ctrlKey &&
      !e.metaKey && // Avoid conflicts with browser shortcuts on macOS
      !isComposing
    ) {
      e.preventDefault();
      onPermissionModeChange(getNextPermissionMode(permissionMode));
      return;
    }

    if (e.key === KEYBOARD_SHORTCUTS.SUBMIT && !isComposing) {
      if (enterBehavior === "newline") {
        handleNewlineModeKeyDown(e);
      } else {
        handleSendModeKeyDown(e);
      }
    }
  };

  const handleNewlineModeKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Newline mode: Enter adds newline, Shift+Enter sends
    if (e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    // Enter is handled naturally by textarea (adds newline)
  };

  const handleSendModeKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Send mode: Enter sends, Shift+Enter adds newline
    if (!e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    // Shift+Enter is handled naturally by textarea (adds newline)
  };
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    // Add small delay to handle race condition between composition and keydown events
    setTimeout(() => setIsComposing(false), 0);
  };

  // Get permission mode status indicator with Lucide icon
  const getPermissionModeIndicator = (mode: PermissionMode) => {
    switch (mode) {
      case "default":
        return (
          <span className="inline-flex items-center gap-1">
            <Wrench size={14} />
            <span>{"\u666E\u901A\u6A21\u5F0F"}</span>
          </span>
        );
      case "plan":
        return (
          <span className="inline-flex items-center gap-1">
            <Pause size={14} />
            <span>{"\u89C4\u5212\u6A21\u5F0F"}</span>
          </span>
        );
      case "acceptEdits":
        return (
          <span className="inline-flex items-center gap-1">
            <FastForward size={14} />
            <span>{"\u81EA\u52A8\u6A21\u5F0F"}</span>
          </span>
        );
    }
  };

  // Get clean permission mode name (without icon)
  const getPermissionModeName = (mode: PermissionMode): string => {
    switch (mode) {
      case "default":
        return "\u666E\u901A\u6A21\u5F0F";
      case "plan":
        return "\u89C4\u5212\u6A21\u5F0F";
      case "acceptEdits":
        return "\u81EA\u52A8\u6A21\u5F0F";
    }
  };

  // Get next permission mode for cycling
  const getNextPermissionMode = (current: PermissionMode): PermissionMode => {
    const modes: PermissionMode[] = ["default", "plan", "acceptEdits"];
    const currentIndex = modes.indexOf(current);
    return modes[(currentIndex + 1) % modes.length];
  };

  // If we're in plan permission mode, show the plan permission panel instead
  if (showPermissions && planPermissionData) {
    return (
      <PlanPermissionInputPanel
        onAcceptWithEdits={planPermissionData.onAcceptWithEdits}
        onAcceptDefault={planPermissionData.onAcceptDefault}
        onKeepPlanning={planPermissionData.onKeepPlanning}
        getButtonClassName={planPermissionData.getButtonClassName}
        onSelectionChange={planPermissionData.onSelectionChange}
        externalSelectedOption={planPermissionData.externalSelectedOption}
      />
    );
  }

  // If we're in regular permission mode, show the permission panel instead
  if (showPermissions && permissionData) {
    return (
      <PermissionInputPanel
        patterns={permissionData.patterns}
        onAllow={permissionData.onAllow}
        onAllowPermanent={permissionData.onAllowPermanent}
        onDeny={permissionData.onDeny}
        getButtonClassName={permissionData.getButtonClassName}
        onSelectionChange={permissionData.onSelectionChange}
        externalSelectedOption={permissionData.externalSelectedOption}
      />
    );
  }

  return (
    <div className="flex-shrink-0">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={
            isLoading && currentRequestId
              ? "Processing..."
              : t("chat.placeholder")
          }
          rows={1}
          className={`w-full px-4 py-3 pr-20 bg-[var(--luckin-surface)] border border-[var(--luckin-border)] rounded-2xl focus:ring-2 focus:ring-[var(--luckin-primary-lighter)] focus:border-transparent transition-all duration-200 shadow-sm text-[var(--luckin-text-primary)] placeholder-[var(--luckin-text-muted)] resize-none overflow-hidden min-h-[48px] max-h-[${UI_CONSTANTS.TEXTAREA_MAX_HEIGHT}px]`}
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-3 flex gap-2">
          {isLoading && currentRequestId && (
            <button
              type="button"
              onClick={onAbort}
              className="p-2 bg-[var(--luckin-error-bg)] hover:bg-[var(--luckin-error-bg)] text-[var(--luckin-error)] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Stop (ESC)"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-luckin-gradient disabled:bg-[var(--luckin-text-muted)] text-[var(--luckin-text-inverse)] rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 text-sm flex items-center gap-1.5"
          >
            {isLoading ? (
              "..."
            ) : (
              <>
                <SendHorizontal size={16} />
                <span>
                  {permissionMode === "plan" ? t("chat.plan") : t("chat.send")}
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Permission mode status bar */}
      <button
        type="button"
        onClick={() =>
          onPermissionModeChange(getNextPermissionMode(permissionMode))
        }
        className="w-full px-4 py-1 text-xs text-[var(--luckin-text-secondary)] hover:text-[var(--luckin-text-primary)] font-mono text-left transition-colors cursor-pointer"
        title={`Current: ${getPermissionModeName(permissionMode)} - Click to cycle (Ctrl+Shift+M)`}
      >
        {getPermissionModeIndicator(permissionMode)}
        <span className="ml-2 text-[var(--luckin-text-muted)] text-[10px]">
          - Click to cycle (Ctrl+Shift+M)
        </span>
      </button>
    </div>
  );
}
