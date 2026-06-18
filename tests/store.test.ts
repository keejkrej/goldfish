import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStore, type Store } from "../lib/store.js";

describe("JsonStore", () => {
  let tmpDir: string;
  let store: Store;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "goldfish-store-"));
    store = createStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates and retrieves a session", () => {
    const session = store.createSession();
    expect(session.messages).toHaveLength(0);

    const fetched = store.getSession(session.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(session.id);
  });

  it("appends messages", () => {
    const session = store.createSession();
    store.appendMessage(session.id, {
      id: crypto.randomUUID(),
      role: "user",
      content: "Hello",
      createdAt: new Date().toISOString(),
    });

    const fetched = store.getSession(session.id);
    expect(fetched?.messages).toHaveLength(1);
    expect(fetched?.messages[0]?.content).toBe("Hello");
  });

  it("searches messages", () => {
    const session = store.createSession();
    store.appendMessage(session.id, {
      id: crypto.randomUUID(),
      role: "user",
      content: "Where did I put the widget design?",
      createdAt: new Date().toISOString(),
    });

    const results = store.searchMessages("widget");
    expect(results).toHaveLength(1);
    expect(results[0]?.message.content).toContain("widget");
  });

  it("lists sessions ordered by updatedAt", async () => {
    const older = store.createSession();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const newer = store.createSession();

    const sessions = store.listSessions();
    expect(sessions.map((s) => s.id)).toEqual([newer.id, older.id]);
  });
});
