import fs from "node:fs";
import path from "node:path";
import { config, ensureDir } from "./config.js";

/**
 * Long-term memory helpers for the agent.
 *
 * Goldfish keeps two markdown files:
 *   - `MEMORY.md`: general facts, preferences, and lessons learned.
 *   - `USER.md`: user-specific profile information.
 */

const memoryDir = path.join(config.home, "memory");
ensureDir(memoryDir);

const memoryPath = path.join(memoryDir, "MEMORY.md");
const userPath = path.join(memoryDir, "USER.md");

function readFile(p: string): string {
  if (!fs.existsSync(p)) {
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function writeFile(p: string, content: string): void {
  fs.writeFileSync(p, content, "utf8");
}

/**
 * Read the full memory document.
 */
export function readMemory(): string {
  return readFile(memoryPath);
}

/**
 * Read the full user profile document.
 */
export function readUser(): string {
  return readFile(userPath);
}

/**
 * Append a fact to the memory document with a timestamp.
 */
export function appendMemory(fact: string): void {
  const existing = readMemory();
  const entry = `- **${new Date().toISOString()}** — ${fact}`;
  const updated = existing ? `${existing}\n\n${entry}` : `# Memory\n\n${entry}`;
  writeFile(memoryPath, updated);
}

/**
 * Append a fact to the user profile document.
 */
export function appendUser(fact: string): void {
  const existing = readUser();
  const entry = `- **${new Date().toISOString()}** — ${fact}`;
  const updated = existing ? `${existing}\n\n${entry}` : `# User Profile\n\n${entry}`;
  writeFile(userPath, updated);
}

/**
 * Update the memory document by replacing it entirely.
 */
export function writeMemory(content: string): void {
  writeFile(memoryPath, content);
}

/**
 * Update the user profile document by replacing it entirely.
 */
export function writeUser(content: string): void {
  writeFile(userPath, content);
}
