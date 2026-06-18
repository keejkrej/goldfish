import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";

/**
 * Goldfish runtime configuration.
 *
 * Loads environment variables first, then merges any values found in
 * `~/.goldfish/config.yaml` (if present).
 */
export interface GoldfishConfig {
  home: string;
  model: string;
  enableSelfImprovement: boolean;
  subagentModel: string;
  mcpUrl?: string;
}

const home = process.env.GOLDFISH_HOME ?? path.join(os.homedir(), ".goldfish");

const defaults: GoldfishConfig = {
  home,
  model: process.env.EVE_MODEL ?? "anthropic/claude-sonnet-4.6",
  enableSelfImprovement: process.env.GOLDFISH_ENABLE_SELF_IMPROVEMENT !== "false",
  subagentModel:
    process.env.GOLDFISH_SUBAGENT_MODEL ?? "anthropic/claude-haiku-4.5",
  mcpUrl: process.env.EVE_MCP_URL,
};

function loadConfigFile(): Partial<GoldfishConfig> {
  const configPath = path.join(home, "config.yaml");
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return yaml.load(raw) as Partial<GoldfishConfig>;
  } catch (error) {
    console.warn("Failed to parse config.yaml:", error);
    return {};
  }
}

export const config: GoldfishConfig = { ...defaults, ...loadConfigFile() };

export function ensureDir(p: string): void {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}
