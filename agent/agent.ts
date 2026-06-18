import { defineAgent } from "eve";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Goldfish runtime configuration.
 *
 * Uses the `@ai-sdk/openai` provider pointed at the local Ollama server's
 * OpenAI-compatible `/v1` endpoint. This produces a real AI SDK LanguageModel
 * instance, so eve classifies it as an *external* provider and bypasses Vercel
 * AI Gateway entirely.
 *
 * Configure via `OLLAMA_BASE_URL` (defaults to `http://localhost:11434`).
 */
const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const apiKey = process.env.OLLAMA_OPENAI_API_KEY ?? "ollama";
const textModel = process.env.EVE_TEXT_MODEL ?? "glm-5.2:cloud";

const ollama = createOpenAI({
  baseURL: `${baseUrl}/v1`,
  apiKey,
});

export default defineAgent({
  model: ollama.languageModel(textModel),
  // Local Ollama model ids are not in the AI Gateway catalog, so tell eve the
  // context window size directly. Adjust if your local model has a different
  // context length.
  modelContextWindowTokens: 128_000,
  compaction: {
    modelContextWindowTokens: 128_000,
  },
});
