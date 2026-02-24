/**
 * Vercel Serverless Function Entry Point
 *
 * Self-contained catch-all serverless function using native Vercel handler format.
 * No framework dependencies — only @anthropic-ai/sdk for chat.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import Anthropic from "@anthropic-ai/sdk";

export const config = {
  maxDuration: 60,
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_SYSTEM_PROMPT =
  "你是Lucky，一个乐于助人的AI助手。你必须始终使用中文回答所有问题。当被问到你的名字时，你要说你是Lucky。无论用户使用什么语言提问，你都必须用中文回复。";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

interface StreamResponse {
  type: "claude_json" | "error" | "done" | "aborted";
  data?: unknown;
  error?: string;
}

// ── In-Memory Conversation Store ───────────────────────────────────────────────

const conversations = new Map<string, MessageParam[]>();
const requestAbortControllers = new Map<string, AbortController>();

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

// ── Helpers ─────────────────────────────────────────────────────────────────────

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// ── Chat Execution ─────────────────────────────────────────────────────────────

async function handleChat(
  res: ServerResponse,
  body: Record<string, unknown>,
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  const model = process.env.ANTHROPIC_MODEL;

  if (!apiKey) {
    sendJson(res, { error: "ANTHROPIC_API_KEY not configured" }, 500);
    return;
  }

  const message = body.message as string;
  const requestId = body.requestId as string;
  const sessionId = body.sessionId as string | undefined;
  const workingDirectory = body.workingDirectory as string | undefined;

  // Set streaming headers
  res.writeHead(200, {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

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

    // Send system init message
    const initMsg: StreamResponse = {
      type: "claude_json",
      data: createSystemInitMessage(
        currentSessionId,
        workingDirectory || "",
        model || DEFAULT_MODEL,
      ),
    };
    res.write(JSON.stringify(initMsg) + "\n");

    // Build messages with history
    const messages = [...history, { role: "user" as const, content: message }];

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
        res.write(JSON.stringify({ type: "aborted" } as StreamResponse) + "\n");
        res.end();
        return;
      }

      if (event.type === "content_block_delta") {
        const delta = event.delta;
        if ("text" in delta) {
          fullResponse += delta.text;
          const chunk: StreamResponse = {
            type: "claude_json",
            data: createAssistantStreamMessage(delta.text, messageId),
          };
          res.write(JSON.stringify(chunk) + "\n");
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

    // Send result message
    const durationMs = Date.now() - startTime;
    const resultMsg: StreamResponse = {
      type: "claude_json",
      data: createResultMessage(inputTokens, outputTokens, durationMs),
    };
    res.write(JSON.stringify(resultMsg) + "\n");
    res.write(JSON.stringify({ type: "done" } as StreamResponse) + "\n");
    res.end();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      res.write(JSON.stringify({ type: "aborted" } as StreamResponse) + "\n");
    } else {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorMsg: StreamResponse = {
        type: "error",
        error: errorMessage,
      };
      res.write(JSON.stringify(errorMsg) + "\n");
    }
    res.end();
  } finally {
    if (requestAbortControllers.has(requestId)) {
      requestAbortControllers.delete(requestId);
    }
  }
}

// ── Main Handler ───────────────────────────────────────────────────────────────

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url || "";

  // Route: GET /api/projects
  if (url.startsWith("/api/projects") && req.method === "GET") {
    // Check if it's a histories request
    if (url.includes("/histories")) {
      sendJson(
        res,
        url.includes("/histories/")
          ? { messages: [], metadata: {} }
          : { conversations: [] },
      );
      return;
    }
    sendJson(res, { projects: [] });
    return;
  }

  // Route: POST /api/chat
  if (url === "/api/chat" && req.method === "POST") {
    const body = await parseBody(req);
    await handleChat(res, body);
    return;
  }

  // Route: POST /api/abort/:requestId
  if (url.startsWith("/api/abort/") && req.method === "POST") {
    const requestId = url.replace("/api/abort/", "");
    const controller = requestAbortControllers.get(requestId);
    if (controller) {
      controller.abort();
      requestAbortControllers.delete(requestId);
    }
    sendJson(res, { success: true });
    return;
  }

  // 404 for unknown routes
  sendJson(res, { error: "Not found" }, 404);
}
