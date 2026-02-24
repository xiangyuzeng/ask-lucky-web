/**
 * Message adapter for converting Anthropic SDK responses to frontend format
 *
 * The frontend expects messages in a specific format that matches the Claude Code SDK.
 * This adapter converts Anthropic API responses to that format.
 */

/**
 * Create a system initialization message
 * @param sessionId - Session identifier
 * @param cwd - Current working directory
 * @param model - Model being used
 * @returns System init message in frontend format
 */
export function createSystemInitMessage(
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

/**
 * Create an assistant streaming message
 * @param text - Text content to stream
 * @returns Assistant message in frontend format
 */
export function createAssistantStreamMessage(text: string, messageId: string) {
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

/**
 * Create a result message with usage statistics
 * @param inputTokens - Number of input tokens used
 * @param outputTokens - Number of output tokens generated
 * @param durationMs - Duration of the request in milliseconds
 * @returns Result message in frontend format
 */
export function createResultMessage(
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
