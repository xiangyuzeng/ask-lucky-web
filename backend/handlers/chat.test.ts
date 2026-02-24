import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Context } from "hono";
import type { ChatRequest } from "../../shared/types";

// Create mock stream function that we can control per test
const mockStreamFn = vi.fn();

// Mock Anthropic SDK
vi.mock("@anthropic-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/sdk")>();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        stream: mockStreamFn,
      },
    })),
    APIError: actual.APIError,
  };
});

// Mock conversation store
vi.mock("../store/conversationStore", () => ({
  getConversation: vi.fn().mockReturnValue([]),
  addToConversation: vi.fn(),
  createSession: vi.fn().mockReturnValue("new-session-id"),
}));

// Mock logger
vi.mock("../utils/logger", () => ({
  logger: {
    chat: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
}));

// Import after mocks are set up
import { handleChatRequest } from "./chat";

describe("Chat Handler - Anthropic SDK Tests", () => {
  let mockContext: Context;
  let requestAbortControllers: Map<string, AbortController>;

  beforeEach(() => {
    requestAbortControllers = new Map();

    // Create mock context
    mockContext = {
      req: {
        json: vi.fn(),
      },
      var: {
        config: {
          anthropicApiKey: "test-api-key",
          model: "claude-sonnet-4-20250514",
        },
      },
    } as any;

    vi.clearAllMocks();
  });

  afterEach(() => {
    requestAbortControllers.clear();
  });

  // Helper to create async iterator from events
  function createMockStream(events: any[]) {
    let index = 0;
    return {
      async next() {
        if (index < events.length) {
          return { value: events[index++], done: false };
        }
        return { value: undefined, done: true };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  // Helper to create throwing async iterator
  function createThrowingStream(error: Error) {
    return {
      async next() {
        throw error;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  describe("Basic Chat Functionality", () => {
    it("should create Anthropic client with API key", async () => {
      const chatRequest: ChatRequest = {
        message: "Test message",
        requestId: "test-123",
      };

      mockContext.req.json = vi.fn().mockResolvedValue(chatRequest);

      const mockEvents = [
        { type: "message_start", message: { usage: { input_tokens: 10 } } },
        { type: "content_block_delta", delta: { text: "Hello" } },
        { type: "message_delta", usage: { output_tokens: 5 } },
      ];

      mockStreamFn.mockReturnValue(createMockStream(mockEvents));

      const response = await handleChatRequest(
        mockContext,
        requestAbortControllers,
      );

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get("Content-Type")).toBe("application/x-ndjson");
    });

    it("should handle streaming responses correctly", async () => {
      const chatRequest: ChatRequest = {
        message: "Test message",
        requestId: "test-456",
      };

      mockContext.req.json = vi.fn().mockResolvedValue(chatRequest);

      const mockEvents = [
        { type: "message_start", message: { usage: { input_tokens: 10 } } },
        { type: "content_block_delta", delta: { text: "Hello " } },
        { type: "content_block_delta", delta: { text: "world" } },
        { type: "message_delta", usage: { output_tokens: 5 } },
      ];

      mockStreamFn.mockReturnValue(createMockStream(mockEvents));

      const response = await handleChatRequest(
        mockContext,
        requestAbortControllers,
      );
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      let allChunks = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        allChunks += decoder.decode(value);
      }

      const lines = allChunks.trim().split("\n");
      expect(lines.length).toBeGreaterThan(0);

      // First line should be system init message
      const firstLine = JSON.parse(lines[0]);
      expect(firstLine.type).toBe("claude_json");
      expect(firstLine.data.type).toBe("system");
    });
  });

  describe("Session Management", () => {
    it("should use existing session ID when provided", async () => {
      const chatRequest: ChatRequest = {
        message: "Test message",
        requestId: "test-789",
        sessionId: "existing-session",
      };

      mockContext.req.json = vi.fn().mockResolvedValue(chatRequest);

      const mockEvents = [
        { type: "message_start", message: { usage: { input_tokens: 5 } } },
        { type: "content_block_delta", delta: { text: "Response" } },
      ];

      mockStreamFn.mockReturnValue(createMockStream(mockEvents));

      const response = await handleChatRequest(
        mockContext,
        requestAbortControllers,
      );
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      let allChunks = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        allChunks += decoder.decode(value);
      }

      const lines = allChunks.trim().split("\n");
      const systemMessage = JSON.parse(lines[0]);
      expect(systemMessage.data.session_id).toBe("existing-session");
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const chatRequest: ChatRequest = {
        message: "Error test",
        requestId: "test-error",
      };

      mockContext.req.json = vi.fn().mockResolvedValue(chatRequest);

      mockStreamFn.mockReturnValue(
        createThrowingStream(new Error("API rate limit exceeded")),
      );

      const response = await handleChatRequest(
        mockContext,
        requestAbortControllers,
      );
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      let allChunks = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        allChunks += decoder.decode(value);
      }

      const lines = allChunks.trim().split("\n");
      const lastLine = JSON.parse(lines[lines.length - 1]);
      expect(lastLine.type).toBe("error");
      expect(lastLine.error).toContain("API rate limit exceeded");
    });
  });

  describe("Abort Controller Management", () => {
    it("should clean up abort controller after completion", async () => {
      const chatRequest: ChatRequest = {
        message: "Controller test",
        requestId: "test-controller",
      };

      mockContext.req.json = vi.fn().mockResolvedValue(chatRequest);

      const mockEvents = [
        { type: "content_block_delta", delta: { text: "Response" } },
      ];

      mockStreamFn.mockReturnValue(createMockStream(mockEvents));

      expect(requestAbortControllers.size).toBe(0);

      const response = await handleChatRequest(
        mockContext,
        requestAbortControllers,
      );

      // Read the response to ensure the generator completes
      const reader = response.body!.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      // Controller should be cleaned up after completion
      expect(requestAbortControllers.size).toBe(0);
    });
  });
});
