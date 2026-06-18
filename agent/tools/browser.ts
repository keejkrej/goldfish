import { defineTool } from "eve/tools";

/**
 * Minimal browser tool.
 *
 * Hermes uses CDP for full browser automation. In eve we start with a fetch-based
 * browser that retrieves and truncates page text. For richer automation, swap
 * this implementation for a headless browser running in the Vercel Sandbox.
 */
export default defineTool({
  description:
    "Fetch a web page and return its text content. Use this to read articles, " +
    "docs, or pages when web_fetch alone is not enough.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      limit: {
        default: 8000,
        description: "Maximum characters to return.",
        maximum: 20000,
        minimum: 1,
        type: "integer",
      },
      url: {
        description: "URL to load.",
        type: "string",
      },
    },
    required: ["url"],
    type: "object",
  },
  async execute(input: { url: string; limit: number }) {
    const response = await fetch(input.url, {
      headers: {
        "User-Agent": "Goldfish/0.1",
      },
    });
    if (!response.ok) {
      return {
        error: `Failed to load ${input.url}: ${response.status} ${response.statusText}`,
      };
    }
    const html = await response.text();
    // Very basic HTML-to-text stripping.
    const text = html
      .replace(/<script\b[^<]*<\/script>/gi, "")
      .replace(/<style\b[^<]*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      url: input.url,
      text: text.length > input.limit ? `${text.slice(0, input.limit)}...` : text,
      truncated: text.length > input.limit,
      length: text.length,
    };
  },
});
