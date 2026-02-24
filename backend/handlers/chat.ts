import { Context } from "hono";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { ChatRequest, StreamResponse } from "../../shared/types.ts";
import { logger } from "../utils/logger.ts";
import { getEnv } from "../utils/os.ts";
import {
  getConversation,
  addToConversation,
  createSession,
} from "../store/conversationStore.ts";
import {
  createSystemInitMessage,
  createAssistantStreamMessage,
  createResultMessage,
} from "../adapters/messageAdapter.ts";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_SYSTEM_PROMPT =
  "你是Lucky，一个乐于助人的AI助手。你必须始终使用中文回答所有问题。当被问到你的名字时，你要说你是Lucky。无论用户使用什么语言提问，你都必须用中文回复。";

/**
 * Formats API errors with better messages, especially for proxy/gateway scenarios
 * @param error - The error to format
 * @returns A user-friendly error message
 */
function formatApiError(error: Error): string {
  const isUsingProxy = !!getEnv("ANTHROPIC_BASE_URL");

  if (error instanceof APIError) {
    const status = error.status;
    const errorBody = error.error as Record<string, unknown> | undefined;

    // Extract nested error message if present (common in proxy responses)
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

/**
 * Executes a chat request using the Anthropic SDK and yields streaming responses
 * @param message - User message
 * @param requestId - Unique request identifier for abort functionality
 * @param requestAbortControllers - Shared map of abort controllers
 * @param apiKey - Anthropic API key
 * @param sessionId - Optional session ID for conversation continuity
 * @param model - Optional model to use
 * @param workingDirectory - Optional working directory (for context)
 * @returns AsyncGenerator yielding StreamResponse objects
 */
async function* executeAnthropicChat(
  message: string,
  requestId: string,
  requestAbortControllers: Map<string, AbortController>,
  apiKey: string,
  sessionId?: string,
  model?: string,
  workingDirectory?: string,
): AsyncGenerator<StreamResponse> {
  const startTime = Date.now();
  let abortController: AbortController;

  try {
    // Create or use existing session
    const currentSessionId = sessionId || createSession();

    // Create and store AbortController for this request
    abortController = new AbortController();
    requestAbortControllers.set(requestId, abortController);

    // Create Anthropic client
    const anthropicBaseUrl = getEnv("ANTHROPIC_BASE_URL");
    const client = new Anthropic({
      apiKey,
      ...(anthropicBaseUrl ? { baseURL: anthropicBaseUrl } : {}),
    });

    // Get conversation history for context
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

    // Build messages array with history
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

    // Handle streaming events
    for await (const event of stream) {
      // Check for abort
      if (abortController.signal.aborted) {
        yield { type: "aborted" };
        return;
      }

      if (event.type === "content_block_delta") {
        const delta = event.delta;
        if ("text" in delta) {
          fullResponse += delta.text;
          // Send only the delta text, not the accumulated fullResponse
          // Frontend appends each chunk, so sending full text would cause duplication
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
    // Check if error is due to abort
    if (error instanceof Error && error.name === "AbortError") {
      yield { type: "aborted" };
    } else {
      const errorMessage =
        error instanceof Error ? formatApiError(error) : String(error);
      logger.chat.error("Anthropic API execution failed: {error}", {
        error: errorMessage,
      });
      yield {
        type: "error",
        error: errorMessage,
      };
    }
  } finally {
    // Clean up AbortController from map
    if (requestAbortControllers.has(requestId)) {
      requestAbortControllers.delete(requestId);
    }
  }
}

/**
 * Handles POST /api/chat requests with streaming responses
 * @param c - Hono context object with config variables
 * @param requestAbortControllers - Shared map of abort controllers
 * @returns Response with streaming NDJSON
 */
export async function handleChatRequest(
  c: Context,
  requestAbortControllers: Map<string, AbortController>,
) {
  const chatRequest: ChatRequest = await c.req.json();
  const { anthropicApiKey, model } = c.var.config;

  logger.chat.debug(
    "Received chat request {*}",
    chatRequest as unknown as Record<string, unknown>,
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of executeAnthropicChat(
          chatRequest.message,
          chatRequest.requestId,
          requestAbortControllers,
          anthropicApiKey,
          chatRequest.sessionId,
          model,
          chatRequest.workingDirectory,
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
}
