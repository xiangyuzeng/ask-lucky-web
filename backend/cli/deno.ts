/**
 * Deno-specific entry point
 *
 * This module handles Deno-specific initialization including CLI argument parsing,
 * API key validation, and server startup using the DenoRuntime.
 */

import { createApp } from "../app.ts";
import { DenoRuntime } from "../runtime/deno.ts";
import { parseCliArgs } from "./args.ts";
import { logger, setupLogger } from "../utils/logger.ts";
import { dirname, fromFileUrl, join } from "@std/path";
import { exit, getEnv } from "../utils/os.ts";

async function main(runtime: DenoRuntime) {
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

  // Create application
  const __dirname = dirname(fromFileUrl(import.meta.url));
  const staticPath = join(__dirname, "../dist/static");

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
if (import.meta.main) {
  const runtime = new DenoRuntime();
  main(runtime).catch((error) => {
    // Logger may not be initialized yet, so use console.error
    console.error("Failed to start server:", error);
    exit(1);
  });
}
