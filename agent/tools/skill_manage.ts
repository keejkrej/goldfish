import { defineTool } from "eve/tools";
import { deleteSkill, listSkills, patchSkill, writeSkill } from "../lib/skills.ts";

/**
 * Create, update, or list user skills at runtime.
 *
 * This is the primary self-improvement surface: after solving a novel problem,
 * the agent can turn the approach into a reusable skill stored under
 * `~/.goldfish/skills/`.
 */
export default defineTool({
  description:
    "Manage procedural skills. Use 'list' to see available skills, 'create' to write a new skill, " +
    "'patch' to append to an existing user skill, and 'delete' to remove one.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      action: {
        enum: ["list", "create", "patch", "delete"],
        type: "string",
      },
      content: {
        description: "Skill body in markdown (for create/patch).",
        type: "string",
      },
      description: {
        description: "Short description (for create/patch).",
        type: "string",
      },
      name: {
        description: "Skill name (for create/patch/delete).",
        type: "string",
      },
    },
    required: ["action"],
    type: "object",
  },
  async execute(input: {
    action: "list" | "create" | "patch" | "delete";
    name?: string;
    description?: string;
    content?: string;
  }) {
    if (input.action === "list") {
      const skills = listSkills();
      return {
        count: skills.length,
        skills: skills.map((s) => ({
          name: s.name,
          description: s.description,
          source: s.source,
        })),
      };
    }

    if (input.action === "create") {
      if (!input.name || !input.description || !input.content) {
        return {
          error: "name, description, and content are required to create a skill",
        };
      }
      writeSkill(input.name, input.description, input.content);
      return { success: true, action: "create", name: input.name };
    }

    if (input.action === "patch") {
      if (!input.name || !input.content) {
        return {
          error: "name and content are required to patch a skill",
        };
      }
      const ok = patchSkill(input.name, input.content);
      return ok
        ? { success: true, action: "patch", name: input.name }
        : { error: `Skill "${input.name}" not found or not a user skill.` };
    }

    if (input.action === "delete") {
      if (!input.name) {
        return { error: "name is required to delete a skill" };
      }
      const ok = deleteSkill(input.name);
      return ok
        ? { success: true, action: "delete", name: input.name }
        : { error: `Skill "${input.name}" not found.` };
    }

    return { error: "unknown action" };
  },
});
