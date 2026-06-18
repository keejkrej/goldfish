import { defineAgent } from "eve";

/**
 * Specialist subagent for focused coding tasks.
 */
export default defineAgent({
  description:
    "Call this subagent for isolated coding tasks such as writing a function, " +
    "fixing a bug, or refactoring a small file. Pass the task and relevant file paths.",
  model: process.env.GOLDFISH_SUBAGENT_MODEL ?? "ollama/glm-5.2:cloud",
  modelContextWindowTokens: 128_000,
});
