import { defineTool } from "eve/tools";
import { listSkills, readSkill } from "../lib/skills.ts";

/**
 * Load a skill's full instructions into the current turn.
 *
 * This custom implementation searches both built-in skills (`agent/skills/`)
 * and user-created skills (`~/.goldfish/skills/`).
 */
export default defineTool({
  description:
    "Load the full instructions for a named skill. Use this when a request matches a skill description.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      skill: {
        description: "Name of the skill to load.",
        type: "string",
      },
    },
    required: ["skill"],
    type: "object",
  },
  async execute(input: { skill: string }) {
    const skill = readSkill(input.skill);
    if (!skill) {
      const available = listSkills().map((s) => s.name).join(", ");
      return {
        error: `Skill "${input.skill}" not found. Available: ${available || "none"}.`,
      };
    }
    return {
      name: skill.name,
      description: skill.description,
      content: skill.content,
    };
  },
});
