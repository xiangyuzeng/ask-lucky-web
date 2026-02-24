/**
 * Vercel Serverless Function Entry Point
 *
 * Single catch-all serverless function handling all /api/* routes using Hono.
 * Imports handlers directly from the backend directory.
 */

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { handleChatRequest } from "../backend/handlers/chat.ts";
import { handleProjectsRequest } from "../backend/handlers/projects.ts";
import { handleAbortRequest } from "../backend/handlers/abort.ts";
import { handleHistoriesRequest } from "../backend/handlers/histories.ts";
import { handleConversationRequest } from "../backend/handlers/conversations.ts";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

// Store AbortControllers for each request (shared with chat handler)
const requestAbortControllers = new Map<string, AbortController>();

// Create Hono app
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

// Configuration middleware - injects config from environment variables
// Matches the AppConfig interface expected by handlers
app.use(
  "*",
  createMiddleware(async (c, next) => {
    c.set("config", {
      debugMode: false,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
      model: process.env.ANTHROPIC_MODEL,
    });
    await next();
  }),
);

// API routes
app.get("/projects", (c) => handleProjectsRequest(c));

app.get("/projects/:encodedProjectName/histories", (c) =>
  handleHistoriesRequest(c),
);

app.get("/projects/:encodedProjectName/histories/:sessionId", (c) =>
  handleConversationRequest(c),
);

app.post("/abort/:requestId", (c) =>
  handleAbortRequest(c, requestAbortControllers),
);

app.post("/chat", (c) => handleChatRequest(c, requestAbortControllers));

export default handle(app);
