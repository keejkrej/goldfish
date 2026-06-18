import { defineAgent } from "eve";

/**
 * Goldfish runtime configuration.
 *
 * Defaults to a local Ollama instance for the text model. The model id and
 * base URL are configurable through environment variables.
 *
 * eve/ai-sdk resolves the `ollama/` provider prefix. For local Ollama, set
 * `OLLAMA_BASE_URL` (defaults to `http://localhost:11434`).
 */
export default defineAgent({
  model: process.env.EVE_MODEL ?? "ollama/glm-5.2:cloud",
  // Ollama model ids are not in the AI Gateway catalog, so tell eve the
  // context window size directly. Adjust if your local model has a different
  // context length.
  modelContextWindowTokens: 128_000,
  compaction: {
    modelContextWindowTokens: 128_000,
  },
  modelOptions: {
    providerOptions: {
      ollama: {
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      },
    },
  },
});
