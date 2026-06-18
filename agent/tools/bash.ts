import { defineBashTool } from "eve/tools";

/**
 * Run shell commands in the agent's shared workspace sandbox.
 *
 * Hermes exposes terminal execution through multiple backends; on eve we use
 * the built-in sandbox-backed bash tool.
 */
export default defineBashTool({
  description:
    "Execute a shell command in the workspace. Prefer safe, read-only commands. " +
    "Confirm destructive commands with the user first.",
});
