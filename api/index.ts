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
import { handleChatRequest } from "../backend/handlers/chat";
import { handleProjectsRequest } from "../backend/handlers/projects";
import { handleAbortRequest } from "../backend/handlers/abort";
import { handleHistoriesRequest } from "../backend/handlers/histories";
import { handleConversationRequest } from "../backend/handlers/conversations";

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Hono version mismatch between root and backend node_modules
app.get("/projects", (c) => handleProjectsRequest(c as any));

app.get("/projects/:encodedProjectName/histories", (c) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleHistoriesRequest(c as any),
);

app.get("/projects/:encodedProjectName/histories/:sessionId", (c) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleConversationRequest(c as any),
);

app.post("/abort/:requestId", (c) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleAbortRequest(c as any, requestAbortControllers),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.post("/chat", (c) => handleChatRequest(c as any, requestAbortControllers));

export default handle(app);
