import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";

/**
 * Pause the turn and ask the user a question.
 *
 * Approval is always required because this tool interrupts the user.
 */
export default defineTool({
  needsApproval: always(),
  description:
    "Ask the user a clarifying question. Use this when requirements are ambiguous " +
    "or before destructive actions.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      question: {
        description: "The question to ask the user.",
        type: "string",
      },
    },
    required: ["question"],
    type: "object",
  },
  async execute(input: { question: string }) {
    return {
      // The framework's approval flow will surface this to the user.
      // The result returned here is what the model sees after approval.
      answerPlaceholder: `User was asked: "${input.question}"`,
    };
  },
});
