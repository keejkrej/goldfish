import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { config, ensureDir } from "./config.ts";

/**
 * A discovered skill.
 */
export interface Skill {
  name: string;
  description: string;
  content: string;
  source: "built-in" | "user";
  platforms?: string[];
  environments?: string[];
}

const builtinSkillsDir = path.resolve(process.cwd(), "agent", "skills");
const userSkillsDir = path.join(config.home, "skills");
ensureDir(userSkillsDir);

function readSkillFile(filePath: string, source: "built-in" | "user", name: string): Skill | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    return {
      name,
      description: (parsed.data.description as string) ?? "",
      content: parsed.content.trim(),
      source,
      platforms: parsed.data.platforms as string[] | undefined,
      environments: parsed.data.environments as string[] | undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * List all available skills: built-in markdown files in `agent/skills/`
 * plus user-created skills in `~/.goldfish/skills/`.
 */
export function listSkills(): Skill[] {
  const skills: Skill[] = [];

  if (fs.existsSync(builtinSkillsDir)) {
    for (const entry of fs.readdirSync(builtinSkillsDir)) {
      if (!entry.endsWith(".md")) {
        continue;
      }
      const name = entry.replace(/\.md$/, "");
      const skill = readSkillFile(path.join(builtinSkillsDir, entry), "built-in", name);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  if (fs.existsSync(userSkillsDir)) {
    for (const entry of fs.readdirSync(userSkillsDir)) {
      const fullPath = path.join(userSkillsDir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const skillPath = path.join(fullPath, "SKILL.md");
        if (fs.existsSync(skillPath)) {
          const skill = readSkillFile(skillPath, "user", entry);
          if (skill) {
            skills.push(skill);
          }
        }
      } else if (entry.endsWith(".md")) {
        const name = entry.replace(/\.md$/, "");
        const skill = readSkillFile(fullPath, "user", name);
        if (skill) {
          skills.push(skill);
        }
      }
    }
  }

  return skills;
}

/**
 * Read the full content of a single skill.
 */
export function readSkill(name: string): Skill | undefined {
  const builtinPath = path.join(builtinSkillsDir, `${name}.md`);
  if (fs.existsSync(builtinPath)) {
    return readSkillFile(builtinPath, "built-in", name);
  }
  const userPath = path.join(userSkillsDir, `${name}.md`);
  if (fs.existsSync(userPath)) {
    return readSkillFile(userPath, "user", name);
  }
  const userDirPath = path.join(userSkillsDir, name, "SKILL.md");
  if (fs.existsSync(userDirPath)) {
    return readSkillFile(userDirPath, "user", name);
  }
  return undefined;
}

/**
 * Write a user skill to disk.
 */
export function writeSkill(
  name: string,
  description: string,
  content: string,
): void {
  const skillDir = path.join(userSkillsDir, name);
  ensureDir(skillDir);
  const frontmatter = matter.stringify(content, { description });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), frontmatter, "utf8");
}

/**
 * Patch an existing user skill by appending content.
 */
export function patchSkill(name: string, appendContent: string): boolean {
  const skill = readSkill(name);
  if (!skill || skill.source !== "user") {
    return false;
  }
  const skillDir = path.join(userSkillsDir, name);
  const skillPath = path.join(skillDir, "SKILL.md");
  const updated = matter.stringify(`${skill.content}\n\n${appendContent}`, {
    description: skill.description,
  });
  fs.writeFileSync(skillPath, updated, "utf8");
  return true;
}

/**
 * Delete a user skill.
 */
export function deleteSkill(name: string): boolean {
  const skillDir = path.join(userSkillsDir, name);
  const skillPath = path.join(skillDir, "SKILL.md");
  if (fs.existsSync(skillPath)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
    return true;
  }
  const flatPath = path.join(userSkillsDir, `${name}.md`);
  if (fs.existsSync(flatPath)) {
    fs.unlinkSync(flatPath);
    return true;
  }
  return false;
}
