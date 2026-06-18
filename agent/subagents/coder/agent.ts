import { defineAgent } from "eve";

/**
 * Specialist subagent for focused coding tasks.
 *
 * Routes through the local Ollama OpenAI-compatible endpoint so it does not
 * need Vercel AI Gateway credentials.
 */
export default defineAgent({
  description:
    "Call this subagent for isolated coding tasks such as writing a function, " +
    "fixing a bug, or refactoring a small file. Pass the task and relevant file paths.",
  model: process.env.GOLDFISH_SUBAGENT_MODEL ?? "openai/glm-5.2:cloud",
  modelContextWindowTokens: 128_000,
  modelOptions: {
    providerOptions: {
      openai: {
        baseURL: `${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/v1`,
        apiKey: process.env.OLLAMA_OPENAI_API_KEY ?? "ollama",
      },
    },
  },
});
