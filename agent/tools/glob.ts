import { defineGlobTool } from "eve/tools";

/**
 * Find files by glob pattern.
 */
export default defineGlobTool({
  description: "Find files in the workspace matching a glob pattern (e.g. '**/*.ts').",
});
