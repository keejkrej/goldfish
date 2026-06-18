import { defineTool } from "eve/tools";
import { store } from "../lib/store.ts";

/**
 * Full-text search over persisted session history.
 *
 * Mirrors Hermes' `session_search` tool: the agent can recall facts from past
 * conversations by keyword.
 */
export default defineTool({
  description:
    "Search past conversation history for a keyword or phrase. " +
    "Returns matching messages with their session IDs and timestamps.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      limit: {
        default: 10,
        description: "Maximum results to return.",
        maximum: 50,
        minimum: 1,
        type: "integer",
      },
      query: {
        description: "Keyword or phrase to search for.",
        type: "string",
      },
    },
    required: ["query"],
    type: "object",
  },
  async execute(input: { query: string; limit: number }) {
    const all = store.searchMessages(input.query);
    const results = all.slice(0, input.limit).map((r) => ({
      sessionId: r.sessionId,
      role: r.message.role,
      content:
        r.message.content.length > 500
          ? `${r.message.content.slice(0, 500)}...`
          : r.message.content,
      createdAt: r.message.createdAt,
      toolName: r.message.toolName,
    }));
    return {
      query: input.query,
      count: results.length,
      results,
    };
  },
});
