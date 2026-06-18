import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { config, ensureDir } from "../lib/config.js";
import { deleteSkill, listSkills, readSkill, writeSkill } from "../lib/skills.js";

describe("skills library", () => {
  let originalHome: string;
  let tmpHome: string;

  beforeEach(() => {
    originalHome = config.home;
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "goldfish-skills-"));
    config.home = tmpHome;
    ensureDir(path.join(tmpHome, "skills"));
  });

  afterEach(() => {
    config.home = originalHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it("creates and reads a user skill", () => {
    writeSkill("demo", "A demo skill", "Use the `echo` command.");
    const skill = readSkill("demo");
    expect(skill).toBeDefined();
    expect(skill?.name).toBe("demo");
    expect(skill?.description).toBe("A demo skill");
    expect(skill?.content).toContain("echo");
  });

  it("lists built-in and user skills", () => {
    writeSkill("user-skill", "User skill", "Body");
    const skills = listSkills();
    const names = skills.map((s) => s.name);
    expect(names).toContain("user-skill");
    // Built-in skills from agent/skills/ are also discovered.
    expect(names).toContain("coding");
  });

  it("deletes a user skill", () => {
    writeSkill("delete-me", "To delete", "Body");
    expect(readSkill("delete-me")).toBeDefined();
    const ok = deleteSkill("delete-me");
    expect(ok).toBe(true);
    expect(readSkill("delete-me")).toBeUndefined();
  });
});
