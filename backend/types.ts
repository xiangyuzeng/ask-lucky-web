/**
 * Backend-specific type definitions
 */

import type { Runtime } from "./runtime/types.ts";

// Application configuration shared across backend handlers
export interface AppConfig {
  debugMode: boolean;
  runtime: Runtime;
  anthropicApiKey: string;
  model?: string; // defaults to claude-sonnet-4-20250514
}
