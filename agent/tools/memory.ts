import { defineTool } from "eve/tools";
import {
  appendMemory,
  appendUser,
  readMemory,
  readUser,
  writeMemory,
  writeUser,
} from "../../lib/memory.js";

/**
 * Read or append to Goldfish's persistent memory.
 *
 * Mirrors Hermes' built-in memory tool: two markdown stores (MEMORY.md and
 * USER.md) that survive across sessions.
 */
export default defineTool({
  description:
    "Read or write long-term memory. Use this to remember facts, user preferences, " +
    "and lessons learned across sessions.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      action: {
        description: "Whether to read, append, or overwrite memory.",
        enum: ["read", "append", "write"],
        type: "string",
      },
      content: {
        description: "Content to append or write. Not needed for read.",
        type: "string",
      },
      store: {
        description: "Which store to target: general memory or user profile.",
        enum: ["memory", "user"],
        type: "string",
      },
    },
    required: ["action", "store"],
    type: "object",
  },
  async execute(input: { action: string; store: "memory" | "user"; content?: string }) {
    if (input.action === "read") {
      return {
        content: input.store === "user" ? readUser() : readMemory(),
      };
    }

    if (!input.content) {
      return { error: "content is required for append/write actions" };
    }

    if (input.action === "append") {
      if (input.store === "user") {
        appendUser(input.content);
      } else {
        appendMemory(input.content);
      }
      return { success: true, action: "append", store: input.store };
    }

    if (input.action === "write") {
      if (input.store === "user") {
        writeUser(input.content);
      } else {
        writeMemory(input.content);
      }
      return { success: true, action: "write", store: input.store };
    }

    return { error: "unknown action" };
  },
});
