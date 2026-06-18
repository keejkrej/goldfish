import { defineWriteFileTool } from "eve/tools";

/**
 * Write files to the workspace sandbox.
 *
 * Enforces read-before-write for existing files (the default eve behavior).
 */
export default defineWriteFileTool({
  description:
    "Write content to a file. Existing files must be read first to avoid stale writes. " +
    "Use this tool for code generation, note taking, and file edits.",
});
