import { useEffect, useCallback, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type {
  ChatRequest,
  ChatMessage,
  ProjectInfo,
  PermissionMode,
  ConversationSummary,
} from "../types";
import { useClaudeStreaming } from "../hooks/useClaudeStreaming";
import { useChatState } from "../hooks/chat/useChatState";
import { usePermissions } from "../hooks/chat/usePermissions";
import { usePermissionMode } from "../hooks/chat/usePermissionMode";
import { useAbortController } from "../hooks/chat/useAbortController";
import { useAutoHistoryLoader } from "../hooks/useHistoryLoader";
import { SettingsModal } from "./SettingsModal";
import { ChatInput } from "./chat/ChatInput";
import { ChatMessages } from "./chat/ChatMessages";
import { HistoryView } from "./HistoryView";
import { getChatUrl, getProjectsUrl, getHistoriesUrl } from "../config/api";
import { KEYBOARD_SHORTCUTS } from "../utils/constants";
import { normalizeWindowsPath } from "../utils/pathUtils";
import type { StreamingContext } from "../hooks/streaming/useMessageProcessor";
import { AppHeader } from "./branding/AppHeader";
import { Sidebar } from "./sidebar/Sidebar";
import { WelcomePage } from "./welcome/WelcomePage";
import { useDepartment } from "../contexts/DepartmentContext";
import type { DepartmentId } from "../types/department";

export function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [hasSelectedDepartment, setHasSelectedDepartment] = useState(false);

  const { setDepartment, resetDepartment, getContextBlock } = useDepartment();

  // Extract and normalize working directory from URL
  const workingDirectory = (() => {
    const rawPath = location.pathname.replace("/projects", "");
    if (!rawPath) return undefined;

    // URL decode the path
    const decodedPath = decodeURIComponent(rawPath);

    // Normalize Windows paths (remove leading slash from /C:/... format)
    return normalizeWindowsPath(decodedPath);
  })();

  // Get current view and sessionId from query parameters
  const currentView = searchParams.get("view");
  const sessionId = searchParams.get("sessionId");
  const isHistoryView = currentView === "history";
  const isLoadedConversation = !!sessionId && !isHistoryView;

  const { processStreamLine } = useClaudeStreaming();
  const { abortRequest, createAbortHandler } = useAbortController();

  // Permission mode state management
  const { permissionMode, setPermissionMode } = usePermissionMode();

  // Get encoded name for current working directory
  const getEncodedName = useCallback(() => {
    if (!workingDirectory || !projects.length) {
      return null;
    }

    const project = projects.find((p) => p.path === workingDirectory);

    // Normalize paths for comparison (handle Windows path issues)
    const normalizedWorking = normalizeWindowsPath(workingDirectory);
    const normalizedProject = projects.find(
      (p) => normalizeWindowsPath(p.path) === normalizedWorking,
    );

    // Use normalized result if exact match fails
    const finalProject = project || normalizedProject;

    return finalProject?.encodedName || null;
  }, [workingDirectory, projects]);

  // Load conversation history if sessionId is provided
  const {
    messages: historyMessages,
    loading: historyLoading,
    error: historyError,
    sessionId: loadedSessionId,
  } = useAutoHistoryLoader(
    getEncodedName() || undefined,
    sessionId || undefined,
  );

  // Initialize chat state with loaded history
  const {
    messages,
    input,
    isLoading,
    currentSessionId,
    currentRequestId,
    hasShownInitMessage,
    currentAssistantMessage,
    setInput,
    setCurrentSessionId,
    setHasShownInitMessage,
    setHasReceivedInit,
    setCurrentAssistantMessage,
    addMessage,
    updateLastMessage,
    clearInput,
    generateRequestId,
    resetRequestState,
    startRequest,
  } = useChatState({
    initialMessages: historyMessages,
    initialSessionId: loadedSessionId || undefined,
  });

  const {
    allowedTools,
    permissionRequest,
    showPermissionRequest,
    closePermissionRequest,
    allowToolTemporary,
    allowToolPermanent,
    isPermissionMode,
    planModeRequest,
    showPlanModeRequest,
    closePlanModeRequest,
    updatePermissionMode,
  } = usePermissions({
    onPermissionModeChange: setPermissionMode,
  });

  const handlePermissionError = useCallback(
    (toolName: string, patterns: string[], toolUseId: string) => {
      // Check if this is an ExitPlanMode permission error
      if (patterns.includes("ExitPlanMode")) {
        // For ExitPlanMode, show plan permission interface instead of regular permission
        showPlanModeRequest(""); // Empty plan content since it was already displayed
      } else {
        showPermissionRequest(toolName, patterns, toolUseId);
      }
    },
    [showPermissionRequest, showPlanModeRequest],
  );

  const sendMessage = useCallback(
    async (
      messageContent?: string,
      tools?: string[],
      hideUserMessage = false,
      overridePermissionMode?: PermissionMode,
    ) => {
      const content = messageContent || input.trim();
      if (!content || isLoading) return;

      // Prepend department context block to the message
      const contextBlock = getContextBlock();
      const messageWithContext = `${contextBlock}\n\n${content}`;

      const requestId = generateRequestId();

      // Only add user message to chat if not hidden (show original content without context)
      if (!hideUserMessage) {
        const userMessage: ChatMessage = {
          type: "chat",
          role: "user",
          content: content,
          timestamp: Date.now(),
        };
        addMessage(userMessage);
      }

      if (!messageContent) clearInput();
      startRequest();

      try {
        const response = await fetch(getChatUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageWithContext,
            requestId,
            ...(currentSessionId ? { sessionId: currentSessionId } : {}),
            allowedTools: tools || allowedTools,
            ...(workingDirectory ? { workingDirectory } : {}),
            permissionMode: overridePermissionMode || permissionMode,
          } as ChatRequest),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Local state for this streaming session
        let localHasReceivedInit = false;
        let shouldAbort = false;

        const streamingContext: StreamingContext = {
          currentAssistantMessage,
          setCurrentAssistantMessage,
          addMessage,
          updateLastMessage,
          onSessionId: setCurrentSessionId,
          shouldShowInitMessage: () => !hasShownInitMessage,
          onInitMessageShown: () => setHasShownInitMessage(true),
          get hasReceivedInit() {
            return localHasReceivedInit;
          },
          setHasReceivedInit: (received: boolean) => {
            localHasReceivedInit = received;
            setHasReceivedInit(received);
          },
          onPermissionError: handlePermissionError,
          onAbortRequest: async () => {
            shouldAbort = true;
            await createAbortHandler(requestId)();
          },
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done || shouldAbort) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            if (shouldAbort) break;
            processStreamLine(line, streamingContext);
          }

          if (shouldAbort) break;
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        addMessage({
          type: "chat",
          role: "assistant",
          content: "Error: Failed to get response",
          timestamp: Date.now(),
        });
      } finally {
        resetRequestState();
      }
    },
    [
      input,
      isLoading,
      currentSessionId,
      allowedTools,
      hasShownInitMessage,
      currentAssistantMessage,
      workingDirectory,
      permissionMode,
      getContextBlock,
      generateRequestId,
      clearInput,
      startRequest,
      addMessage,
      updateLastMessage,
      setCurrentSessionId,
      setHasShownInitMessage,
      setHasReceivedInit,
      setCurrentAssistantMessage,
      resetRequestState,
      processStreamLine,
      handlePermissionError,
      createAbortHandler,
    ],
  );

  const handleAbort = useCallback(() => {
    abortRequest(currentRequestId, isLoading, resetRequestState);
  }, [abortRequest, currentRequestId, isLoading, resetRequestState]);

  // Permission request handlers
  const handlePermissionAllow = useCallback(() => {
    if (!permissionRequest) return;

    // Add all patterns temporarily
    let updatedAllowedTools = allowedTools;
    permissionRequest.patterns.forEach((pattern) => {
      updatedAllowedTools = allowToolTemporary(pattern, updatedAllowedTools);
    });

    closePermissionRequest();

    if (currentSessionId) {
      sendMessage("continue", updatedAllowedTools, true);
    }
  }, [
    permissionRequest,
    currentSessionId,
    sendMessage,
    allowedTools,
    allowToolTemporary,
    closePermissionRequest,
  ]);

  const handlePermissionAllowPermanent = useCallback(() => {
    if (!permissionRequest) return;

    // Add all patterns permanently
    let updatedAllowedTools = allowedTools;
    permissionRequest.patterns.forEach((pattern) => {
      updatedAllowedTools = allowToolPermanent(pattern, updatedAllowedTools);
    });

    closePermissionRequest();

    if (currentSessionId) {
      sendMessage("continue", updatedAllowedTools, true);
    }
  }, [
    permissionRequest,
    currentSessionId,
    sendMessage,
    allowedTools,
    allowToolPermanent,
    closePermissionRequest,
  ]);

  const handlePermissionDeny = useCallback(() => {
    closePermissionRequest();
  }, [closePermissionRequest]);

  // Plan mode request handlers
  const handlePlanAcceptWithEdits = useCallback(() => {
    updatePermissionMode("acceptEdits");
    closePlanModeRequest();
    if (currentSessionId) {
      sendMessage("accept", allowedTools, true, "acceptEdits");
    }
  }, [
    updatePermissionMode,
    closePlanModeRequest,
    currentSessionId,
    sendMessage,
    allowedTools,
  ]);

  const handlePlanAcceptDefault = useCallback(() => {
    updatePermissionMode("default");
    closePlanModeRequest();
    if (currentSessionId) {
      sendMessage("accept", allowedTools, true, "default");
    }
  }, [
    updatePermissionMode,
    closePlanModeRequest,
    currentSessionId,
    sendMessage,
    allowedTools,
  ]);

  const handlePlanKeepPlanning = useCallback(() => {
    updatePermissionMode("plan");
    closePlanModeRequest();
  }, [updatePermissionMode, closePlanModeRequest]);

  // Create permission data for inline permission interface
  const permissionData = permissionRequest
    ? {
        patterns: permissionRequest.patterns,
        onAllow: handlePermissionAllow,
        onAllowPermanent: handlePermissionAllowPermanent,
        onDeny: handlePermissionDeny,
      }
    : undefined;

  // Create plan permission data for plan mode interface
  const planPermissionData = planModeRequest
    ? {
        onAcceptWithEdits: handlePlanAcceptWithEdits,
        onAcceptDefault: handlePlanAcceptDefault,
        onKeepPlanning: handlePlanKeepPlanning,
      }
    : undefined;

  const handleHistoryClick = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("view", "history");
    navigate({ search: searchParams.toString() });
  }, [navigate]);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Load projects to get encodedName mapping
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(getProjectsUrl());
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

  // Load conversations for sidebar
  useEffect(() => {
    const encodedName = getEncodedName();
    if (!encodedName) return;

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const response = await fetch(getHistoriesUrl(encodedName));
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    loadConversations();
  }, [getEncodedName]);

  const handleBackToChat = useCallback(() => {
    navigate({ search: "" });
  }, [navigate]);

  const handleBackToHistory = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("view", "history");
    navigate({ search: searchParams.toString() });
  }, [navigate]);

  const handleSelectConversation = useCallback(
    (selectedSessionId: string) => {
      const searchParams = new URLSearchParams();
      searchParams.set("sessionId", selectedSessionId);
      navigate({ search: searchParams.toString() });
    },
    [navigate],
  );

  const handleSelectTemplate = useCallback(
    (prompt: string) => {
      setInput(prompt);
    },
    [setInput],
  );

  const handleDepartmentSelect = useCallback(
    (departmentId: DepartmentId) => {
      setDepartment(departmentId);
      setHasSelectedDepartment(true);
    },
    [setDepartment],
  );

  // Handle logo click - return to welcome page
  const handleLogoClick = useCallback(() => {
    resetDepartment();
    setHasSelectedDepartment(false);
    setCurrentSessionId(null);
    navigate({ search: "" });
  }, [resetDepartment, setCurrentSessionId, navigate]);

  // Handle new conversation - clear chat but keep department
  const handleNewConversation = useCallback(() => {
    setCurrentSessionId(null);
    navigate({ search: "" });
    // Force re-render by resetting hasSelectedDepartment and setting it back
    // This clears messages since useChatState will reinitialize
    window.location.href = window.location.pathname;
  }, [setCurrentSessionId, navigate]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_SHORTCUTS.ABORT && isLoading && currentRequestId) {
        e.preventDefault();
        handleAbort();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isLoading, currentRequestId, handleAbort]);

  // Show welcome page when no messages and not in history view and no department selected
  const showWelcomePage =
    messages.length === 0 &&
    !isHistoryView &&
    !historyLoading &&
    !sessionId &&
    !hasSelectedDepartment;

  return (
    <div className="min-h-screen bg-luckin-bg transition-colors duration-300 flex flex-col">
      {/* Header */}
      <AppHeader
        onToggleSidebar={handleToggleSidebar}
        onHistoryClick={handleHistoryClick}
        onSettingsClick={handleSettingsClick}
        onLogoClick={handleLogoClick}
        onNewConversation={
          hasSelectedDepartment ? handleNewConversation : undefined
        }
        showDepartmentBadge={hasSelectedDepartment}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          encodedName={getEncodedName()}
          onSelectConversation={handleSelectConversation}
          onSelectTemplate={handleSelectTemplate}
          conversations={conversations}
          isLoadingConversations={isLoadingConversations}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="max-w-6xl mx-auto w-full p-3 sm:p-6 flex-1 flex flex-col">
            {/* Breadcrumb for history/conversation views */}
            {(isHistoryView || isLoadedConversation) && (
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <button
                  onClick={
                    isHistoryView ? handleBackToChat : handleBackToHistory
                  }
                  className="p-2 rounded-lg bg-luckin-surface border border-luckin hover:bg-luckin-sky transition-luckin"
                  aria-label={
                    isHistoryView ? "Back to chat" : "Back to history"
                  }
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-luckin-secondary text-sm">
                  {isHistoryView ? "Conversation History" : "Conversation"}
                </span>
                {sessionId && (
                  <span className="text-xs text-luckin-muted">
                    Session: {sessionId.substring(0, 8)}...
                  </span>
                )}
              </div>
            )}

            {/* Main Content Area */}
            {isHistoryView ? (
              <HistoryView
                workingDirectory={workingDirectory || ""}
                encodedName={getEncodedName()}
                onBack={handleBackToChat}
              />
            ) : historyLoading ? (
              /* Loading conversation history */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-luckin-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-luckin-secondary">
                    Loading conversation history...
                  </p>
                </div>
              </div>
            ) : historyError ? (
              /* Error loading conversation history */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 bg-luckin-error rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-luckin-error"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-luckin-primary text-xl font-semibold mb-2">
                    Error Loading Conversation
                  </h2>
                  <p className="text-luckin-secondary text-sm mb-4">
                    {historyError}
                  </p>
                  <button
                    onClick={() => navigate({ search: "" })}
                    className="px-4 py-2 btn-luckin-primary rounded-lg"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            ) : showWelcomePage ? (
              <WelcomePage onDepartmentSelect={handleDepartmentSelect} />
            ) : (
              <>
                {/* Chat Messages */}
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  onQuickAction={(prompt) => {
                    setInput(prompt);
                  }}
                />

                {/* Input */}
                <ChatInput
                  input={input}
                  isLoading={isLoading}
                  currentRequestId={currentRequestId}
                  onInputChange={setInput}
                  onSubmit={() => sendMessage()}
                  onAbort={handleAbort}
                  permissionMode={permissionMode}
                  onPermissionModeChange={setPermissionMode}
                  showPermissions={isPermissionMode}
                  permissionData={permissionData}
                  planPermissionData={planPermissionData}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={handleSettingsClose} />
    </div>
  );
}
