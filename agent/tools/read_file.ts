import { defineReadFileTool } from "eve/tools";

/**
 * Read files from the workspace sandbox.
 */
export default defineReadFileTool({
  description:
    "Read the contents of a file. Use absolute paths. For large files, use offset/limit or grep first.",
});
