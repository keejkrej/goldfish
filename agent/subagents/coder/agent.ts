import { defineAgent } from "eve";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Specialist subagent for focused coding tasks.
 *
 * Routes through the local Ollama OpenAI-compatible endpoint so it does not
 * need Vercel AI Gateway credentials.
 */
const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const apiKey = process.env.OLLAMA_OPENAI_API_KEY ?? "ollama";
const textModel = process.env.GOLDFISH_SUBAGENT_TEXT_MODEL ?? "glm-5.2:cloud";

const ollama = createOpenAI({
  baseURL: `${baseUrl}/v1`,
  apiKey,
});

export default defineAgent({
  description:
    "Call this subagent for isolated coding tasks such as writing a function, " +
    "fixing a bug, or refactoring a small file. Pass the task and relevant file paths.",
  model: ollama.languageModel(textModel),
  modelContextWindowTokens: 128_000,
});
