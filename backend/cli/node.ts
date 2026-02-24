#!/usr/bin/env node
/**
 * Node.js-specific entry point
 *
 * This module handles Node.js-specific initialization including CLI argument parsing,
 * API key validation, and server startup using the NodeRuntime.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { createApp } from "../app.ts";
import { NodeRuntime } from "../runtime/node.ts";
import { parseCliArgs } from "./args.ts";
import { setupLogger, logger } from "../utils/logger.ts";
import { exit, getEnv } from "../utils/os.ts";

// Load .env file from project root (parent of backend/) before anything else
try {
  const envContent = readFileSync(resolve(process.cwd(), "../.env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    // Only set if not already defined with a non-empty value (environment takes precedence)
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file is optional — environment variables can be set externally
}

async function main(runtime: NodeRuntime) {
  // Parse CLI arguments
  const args = parseCliArgs();

  // Initialize logging system
  await setupLogger(args.debug);

  if (args.debug) {
    logger.cli.info("🐛 Debug mode enabled");
  }

  // Get Anthropic API key from environment
  const anthropicApiKey = getEnv("ANTHROPIC_API_KEY");
  if (!anthropicApiKey) {
    logger.cli.error("❌ ANTHROPIC_API_KEY environment variable is required");
    logger.cli.error("   Please set your Anthropic API key:");
    logger.cli.error("   export ANTHROPIC_API_KEY=sk-ant-...");
    exit(1);
  }

  // Get optional model from environment
  const model = getEnv("ANTHROPIC_MODEL");

  // Use absolute path for static files (supported in @hono/node-server v1.17.0+)
  // Node.js 20.11.0+ compatible with fallback for older versions
  const __dirname =
    import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
  const staticPath = join(__dirname, "../static");

  // Create application
  const app = createApp(runtime, {
    debugMode: args.debug,
    staticPath,
    anthropicApiKey,
    model,
  });

  // Start server (only show this message when everything is ready)
  logger.cli.info(`🚀 Server starting on ${args.host}:${args.port}`);
  runtime.serve(args.port, args.host, app.fetch);
}

// Run the application
const runtime = new NodeRuntime();
main(runtime).catch((error) => {
  // Logger may not be initialized yet, so use console.error
  console.error("Failed to start server:", error);
  exit(1);
});
