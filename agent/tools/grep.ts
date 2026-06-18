import { defineGrepTool } from "eve/tools";

/**
 * Search file contents by regex pattern.
 */
export default defineGrepTool({
  description:
    "Search the contents of files for a regex pattern. Useful for finding definitions, usages, or TODOs.",
});
