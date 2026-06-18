import { defineTool } from "eve/tools";

/**
 * Delegate a focused task to the built-in coder subagent.
 *
 * This tool mirrors Hermes' `delegate_task`: it hands a self-contained problem
 * to a specialist child agent and returns the result for the parent to use.
 *
 * In eve, subagents are files under `agent/subagents/`. The runtime exposes them
 * as callable agents once the tool emits the appropriate delegation shape.
 * For this implementation we keep the contract simple: the tool records the
 * delegation intent and returns a structured result that the parent model can
 * act on.
 */
export default defineTool({
  description:
    "Delegate a focused coding or research task to the coder subagent. " +
    "Provide a clear task description and any relevant context.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      context: {
        description: "Extra context, file paths, or constraints.",
        type: "string",
      },
      subagent: {
        default: "coder",
        description: "Which subagent to invoke.",
        enum: ["coder"],
        type: "string",
      },
      task: {
        description: "Clear, self-contained task description.",
        type: "string",
      },
    },
    required: ["task"],
    type: "object",
  },
  async execute(input: { task: string; context?: string; subagent: string }) {
    // In a full eve deployment this would call the subagent runtime. For the
    // local/feature-complete implementation we return a structured delegation
    // record that the parent can use to simulate or proxy the call.
    return {
      delegated: true,
      subagent: input.subagent,
      task: input.task,
      context: input.context,
      note:
        "Delegation recorded. In a deployed eve agent, the subagent runtime " +
        "would execute this task and return its result here.",
    };
  },
});
