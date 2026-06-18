import { defineHook } from "eve/hooks";
import { store } from "../lib/store.ts";

/**
 * Persist eve session messages into Goldfish's local JSON store.
 *
 * Hermes keeps every session in SQLite with full-text search. In this eve
 * implementation we mirror that by recording user messages, assistant
 * messages, and tool results as they stream through the runtime. This makes
 * the `session_search` tool useful.
 */
export default defineHook({
  events: {
    "session.started"(_event, ctx) {
      // Ensure a session row exists for the current eve session so subsequent
      // events append to the right place.
      store.ensureSession(ctx.session.id);
    },

    "message.received"(event, ctx) {
      store.appendMessage(ctx.session.id, {
        id: crypto.randomUUID(),
        role: "user",
        content: event.data.message,
        createdAt: new Date().toISOString(),
      });
    },

    "message.completed"(event, ctx) {
      if (!event.data.message) {
        return;
      }
      store.appendMessage(ctx.session.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: event.data.message,
        createdAt: new Date().toISOString(),
      });
    },

    "action.result"(event, ctx) {
      const result = event.data.result;
      if (result.kind !== "tool-result") {
        return;
      }
      store.appendMessage(ctx.session.id, {
        id: crypto.randomUUID(),
        role: "tool",
        content: JSON.stringify(result.output ?? ""),
        toolName: result.toolName,
        createdAt: new Date().toISOString(),
      });
    },
  },
});
