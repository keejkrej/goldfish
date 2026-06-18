import { defineAgent } from "eve";

/**
 * Goldfish runtime configuration.
 *
 * Defaults to a local Ollama instance for the text model. Ollama exposes an
 * OpenAI-compatible `/v1` endpoint, so we use the `openai/` provider prefix
 * and point it at the local server. This avoids requiring Vercel AI Gateway
 * credentials.
 *
 * Configure via `OLLAMA_BASE_URL` (defaults to `http://localhost:11434`).
 */
export default defineAgent({
  model: process.env.EVE_MODEL ?? "openai/glm-5.2:cloud",
  // Local Ollama model ids are not in the AI Gateway catalog, so tell eve the
  // context window size directly. Adjust if your local model has a different
  // context length.
  modelContextWindowTokens: 128_000,
  compaction: {
    modelContextWindowTokens: 128_000,
  },
  modelOptions: {
    providerOptions: {
      openai: {
        baseURL: `${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/v1`,
        apiKey: process.env.OLLAMA_OPENAI_API_KEY ?? "ollama",
      },
    },
  },
});
