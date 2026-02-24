/**
 * Vercel Serverless Function Entry Point
 *
 * Self-contained catch-all serverless function handling all /api/* routes.
 * Does NOT import from backend/ to avoid .ts extension and logger initialization issues.
 */

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_SYSTEM_PROMPT =
  "你是Lucky，一个乐于助人的AI助手。你必须始终使用中文回答所有问题。当被问到你的名字时，你要说你是Lucky。无论用户使用什么语言提问，你都必须用中文回复。";

// ── In-Memory Conversation Store ───────────────────────────────────────────────

const conversations = new Map<string, MessageParam[]>();

function createSession(): string {
  return crypto.randomUUID();
}

function getConversation(sessionId: string): MessageParam[] {
  return conversations.get(sessionId) || [];
}

function addToConversation(
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
): void {
  const history = conversations.get(sessionId) || [];
  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: assistantResponse });
  conversations.set(sessionId, history);
}

// ── Message Adapters (frontend-compatible format) ──────────────────────────────

function createSystemInitMessage(
  sessionId: string,
  cwd: string,
  model: string,
) {
  return {
    type: "system",
    subtype: "init",
    session_id: sessionId,
    cwd,
    tools: [],
    mcp_servers: [],
    model,
    permissionMode: "default",
    apiKeySource: "environment",
  };
}

function createAssistantStreamMessage(text: string, messageId: string) {
  return {
    type: "assistant",
    message: {
      id: messageId,
      type: "message",
      role: "assistant",
      content: [{ type: "text", text }],
      model: "",
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: 0, output_tokens: 0 },
    },
  };
}

function createResultMessage(
  inputTokens: number,
  outputTokens: number,
  durationMs: number,
) {
  return {
    type: "result",
    subtype: "success",
    cost_usd: 0,
    duration_ms: durationMs,
    duration_api_ms: durationMs,
    is_error: false,
    num_turns: 1,
    result: "",
    session_id: "",
    total_cost_usd: 0,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  };
}

// ── Error Formatting ───────────────────────────────────────────────────────────

function formatApiError(error: Error): string {
  const isUsingProxy = !!process.env.ANTHROPIC_BASE_URL;

  if (error instanceof APIError) {
    const status = error.status;
    const errorBody = error.error as Record<string, unknown> | undefined;

    let message = error.message;
    if (errorBody?.error && typeof errorBody.error === "object") {
      const nested = errorBody.error as Record<string, unknown>;
      if (nested.message) {
        message = String(nested.message);
      }
      if (nested.code) {
        message = `[${nested.code}] ${message}`;
      }
    }

    if (isUsingProxy) {
      return `Proxy error (${status}): ${message}. Check your ANTHROPIC_BASE_URL configuration.`;
    }
    return `API error (${status}): ${message}`;
  }

  return error.message;
}

// ── Stream Response Types ──────────────────────────────────────────────────────

interface StreamResponse {
  type: "claude_json" | "error" | "done" | "aborted";
  data?: unknown;
  error?: string;
}

// ── Chat Execution ─────────────────────────────────────────────────────────────

const requestAbortControllers = new Map<string, AbortController>();

async function* executeAnthropicChat(
  message: string,
  requestId: string,
  apiKey: string,
  sessionId?: string,
  model?: string,
  workingDirectory?: string,
): AsyncGenerator<StreamResponse> {
  const startTime = Date.now();

  try {
    const currentSessionId = sessionId || createSession();

    // Create and store AbortController
    const abortController = new AbortController();
    requestAbortControllers.set(requestId, abortController);

    // Create Anthropic client
    const anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL;
    const client = new Anthropic({
      apiKey,
      ...(anthropicBaseUrl ? { baseURL: anthropicBaseUrl } : {}),
    });

    // Get conversation history
    const history = getConversation(currentSessionId);

    // Emit system init message
    yield {
      type: "claude_json",
      data: createSystemInitMessage(
        currentSessionId,
        workingDirectory || "",
        model || DEFAULT_MODEL,
      ),
    };

    // Build messages with history
    const messages: MessageParam[] = [
      ...history,
      { role: "user" as const, content: message },
    ];

    // Stream response from Anthropic
    const stream = client.messages.stream({
      model: model || DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      messages,
      system: DEFAULT_SYSTEM_PROMPT,
    });

    let fullResponse = "";
    let inputTokens = 0;
    let outputTokens = 0;
    const messageId = crypto.randomUUID();

    for await (const event of stream) {
      if (abortController.signal.aborted) {
        yield { type: "aborted" };
        return;
      }

      if (event.type === "content_block_delta") {
        const delta = event.delta;
        if ("text" in delta) {
          fullResponse += delta.text;
          yield {
            type: "claude_json",
            data: createAssistantStreamMessage(delta.text, messageId),
          };
        }
      } else if (event.type === "message_delta") {
        if (event.usage) {
          outputTokens = event.usage.output_tokens;
        }
      } else if (event.type === "message_start") {
        if (event.message.usage) {
          inputTokens = event.message.usage.input_tokens;
        }
      }
    }

    // Store conversation history
    if (fullResponse) {
      addToConversation(currentSessionId, message, fullResponse);
    }

    // Emit result message
    const durationMs = Date.now() - startTime;
    yield {
      type: "claude_json",
      data: createResultMessage(inputTokens, outputTokens, durationMs),
    };

    yield { type: "done" };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      yield { type: "aborted" };
    } else {
      const errorMessage =
        error instanceof Error ? formatApiError(error) : String(error);
      yield {
        type: "error",
        error: errorMessage,
      };
    }
  } finally {
    if (requestAbortControllers.has(requestId)) {
      requestAbortControllers.delete(requestId);
    }
  }
}

// ── Hono App ───────────────────────────────────────────────────────────────────

const app = new Hono().basePath("/api");

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// ── Routes ─────────────────────────────────────────────────────────────────────

// Projects — always return empty (no local filesystem on Vercel)
app.get("/projects", (c) => {
  return c.json({ projects: [] });
});

// Histories — always return empty
app.get("/projects/:encodedProjectName/histories", (c) => {
  return c.json({ conversations: [] });
});

// Conversation — always return empty
app.get("/projects/:encodedProjectName/histories/:sessionId", (c) => {
  return c.json({ messages: [], metadata: {} });
});

// Abort — cancel in-flight request
app.post("/abort/:requestId", (c) => {
  const requestId = c.req.param("requestId");
  const controller = requestAbortControllers.get(requestId);
  if (controller) {
    controller.abort();
    requestAbortControllers.delete(requestId);
  }
  return c.json({ success: true });
});

// Chat — stream Anthropic API responses
app.post("/chat", async (c) => {
  const body = await c.req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  const model = process.env.ANTHROPIC_MODEL;

  if (!apiKey) {
    return c.json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of executeAnthropicChat(
          body.message,
          body.requestId,
          apiKey,
          body.sessionId,
          model,
          body.workingDirectory,
        )) {
          const data = JSON.stringify(chunk) + "\n";
          controller.enqueue(new TextEncoder().encode(data));
        }
        controller.close();
      } catch (error) {
        const errorResponse: StreamResponse = {
          type: "error",
          error: error instanceof Error ? error.message : String(error),
        };
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(errorResponse) + "\n"),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default handle(app);
