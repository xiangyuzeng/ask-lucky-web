/**
 * In-memory conversation store for maintaining chat history
 *
 * Stores conversation history per session to provide context for follow-up messages.
 */

import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

// In-memory store: sessionId -> message history
const conversations = new Map<string, MessageParam[]>();

/**
 * Get conversation history for a session
 * @param sessionId - Session identifier
 * @returns Array of messages in the conversation
 */
export function getConversation(sessionId: string): MessageParam[] {
  return conversations.get(sessionId) || [];
}

/**
 * Add messages to a conversation
 * @param sessionId - Session identifier
 * @param userMessage - User message content
 * @param assistantMessage - Assistant response content
 */
export function addToConversation(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
): void {
  const history = conversations.get(sessionId) || [];
  history.push(
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantMessage },
  );
  conversations.set(sessionId, history);
}

/**
 * Create a new session with a unique ID
 * @returns New session UUID
 */
export function createSession(): string {
  return crypto.randomUUID();
}

/**
 * Check if a session exists
 * @param sessionId - Session identifier
 * @returns True if session exists
 */
export function hasSession(sessionId: string): boolean {
  return conversations.has(sessionId);
}

/**
 * Clear a session's conversation history
 * @param sessionId - Session identifier
 */
export function clearSession(sessionId: string): void {
  conversations.delete(sessionId);
}
