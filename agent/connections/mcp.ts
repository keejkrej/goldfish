import { defineMcpClientConnection } from "eve/connections";

/**
 * Optional MCP client connection.
 *
 * Reads the MCP server URL from `EVE_MCP_URL`. When unset, the connection is
 * inert so the agent boots cleanly without an MCP server.
 *
 * This mirrors Hermes' MCP client integration under `tools/mcp_tool.py`.
 */
const url = process.env.EVE_MCP_URL ?? "http://127.0.0.1:0/mcp";

export default defineMcpClientConnection({
  url,
  description:
    "External MCP server connection. Set EVE_MCP_URL to enable. " +
    "Discover and call tools exposed by this server.",
});
