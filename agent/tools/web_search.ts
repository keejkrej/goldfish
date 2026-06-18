import { defineTool } from "eve/tools";

/**
 * Web search via the Ollama REST API.
 *
 * Endpoint: POST https://ollama.com/api/web_search
 * Requires `OLLAMA_API_KEY` in the environment or an Authorization header.
 *
 * Docs: https://docs.ollama.com/capabilities/web-search
 */
export default defineTool({
  description:
    "Search the web using Ollama. Returns a list of result snippets with titles, URLs, and content.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      maxResults: {
        default: 5,
        description: "Maximum number of results to return (max 10).",
        maximum: 10,
        minimum: 1,
        type: "integer",
      },
      query: {
        description: "The search query.",
        type: "string",
      },
    },
    required: ["query"],
    type: "object",
  },
  async execute(input: { query: string; maxResults: number }) {
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      return {
        error:
          "OLLAMA_API_KEY is not set. Get a key at https://ollama.com/settings/keys.",
      };
    }

    const searchUrl =
      process.env.OLLAMA_WEB_SEARCH_URL ?? "https://ollama.com/api/web_search";

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: input.query,
        max_results: input.maxResults,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        error: `Ollama web search failed: ${response.status} ${response.statusText}${body ? ` — ${body}` : ""}`,
      };
    }

    const data = (await response.json()) as {
      results?: Array<{ title: string; url: string; content: string }>;
    };

    return {
      query: input.query,
      results: data.results ?? [],
    };
  },
});
