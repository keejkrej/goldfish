import fs from "node:fs";
import path from "node:path";
import { config, ensureDir } from "./config.js";

/**
 * A persisted message in a session.
 */
export interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolCallId?: string;
  createdAt: string;
}

/**
 * A persisted session.
 */
export interface StoredSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  messages: StoredMessage[];
}

/**
 * Pluggable session store interface.
 *
 * The default implementation is JSON-file backed. For production on Vercel,
 * replace this with an adapter backed by Postgres, KV, or another durable store.
 */
export interface Store {
  createSession(): StoredSession;
  ensureSession(id: string): StoredSession;
  getSession(id: string): StoredSession | undefined;
  appendMessage(sessionId: string, message: StoredMessage): void;
  listSessions(): StoredSession[];
  searchMessages(query: string): Array<{ sessionId: string; message: StoredMessage }>;
  saveSessionTitle(sessionId: string, title: string): void;
}

function atomicWrite(filePath: string, data: unknown): void {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}

class JsonStore implements Store {
  private readonly sessionsDir: string;

  constructor(home: string) {
    this.sessionsDir = path.join(home, "sessions");
    ensureDir(this.sessionsDir);
  }

  private sessionPath(id: string): string {
    return path.join(this.sessionsDir, `${id}.json`);
  }

  createSession(): StoredSession {
    return this.ensureSession(crypto.randomUUID());
  }

  ensureSession(id: string): StoredSession {
    const existing = this.getSession(id);
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    const session: StoredSession = {
      id,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    atomicWrite(this.sessionPath(id), session);
    return session;
  }

  getSession(id: string): StoredSession | undefined {
    const p = this.sessionPath(id);
    if (!fs.existsSync(p)) {
      return undefined;
    }
    try {
      const raw = fs.readFileSync(p, "utf8");
      return JSON.parse(raw) as StoredSession;
    } catch {
      return undefined;
    }
  }

  appendMessage(sessionId: string, message: StoredMessage): void {
    const session = this.getSession(sessionId);
    if (!session) {
      return;
    }
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    atomicWrite(this.sessionPath(sessionId), session);
  }

  listSessions(): StoredSession[] {
    if (!fs.existsSync(this.sessionsDir)) {
      return [];
    }
    const files = fs.readdirSync(this.sessionsDir).filter((f) => f.endsWith(".json"));
    const sessions: StoredSession[] = [];
    for (const file of files) {
      const session = this.getSession(file.replace(".json", ""));
      if (session) {
        sessions.push(session);
      }
    }
    return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  searchMessages(query: string): Array<{ sessionId: string; message: StoredMessage }> {
    const q = query.toLowerCase();
    const results: Array<{ sessionId: string; message: StoredMessage }> = [];
    for (const session of this.listSessions()) {
      for (const message of session.messages) {
        if (message.content.toLowerCase().includes(q)) {
          results.push({ sessionId: session.id, message });
        }
      }
    }
    // Most recent first
    return results.reverse();
  }

  saveSessionTitle(sessionId: string, title: string): void {
    const session = this.getSession(sessionId);
    if (!session) {
      return;
    }
    session.title = title;
    session.updatedAt = new Date().toISOString();
    atomicWrite(this.sessionPath(sessionId), session);
  }
}

/**
 * Create a JSON-backed store rooted at `home`.
 */
export function createStore(home: string): Store {
  return new JsonStore(home);
}

/**
 * Default global store using the configured Goldfish home directory.
 */
export const store: Store = createStore(config.home);
