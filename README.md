# Goldfish

A self-improving, continual-learning AI agent inspired by [Hermes Agent](https://github.com/nousresearch/hermes-agent), rebuilt on [Vercel eve](https://vercel.com/docs/eve).

## Overview

Goldfish demonstrates how Hermes' core "closed learning loop" can be expressed as filesystem-first eve primitives:

- **Durable sessions** via Vercel Workflow (`agent/agent.ts`).
- **Local Ollama backend** for text generation (`glm-5.2:cloud`) and vision (`gemma4:31b-cloud`).
- **Tool system** using eve defaults plus custom tools for memory, skill management, delegation, session search, web search, and image analysis.
- **Markdown-first skills** in `agent/skills/` that the agent can load and create at runtime.
- **Self-improvement** via a daily review schedule and explicit `memory` / `skill_manage` tools.
- **Subagents** under `agent/subagents/`.
- **MCP client** connection under `agent/connections/`.
- **Session persistence bridge** via `agent/hooks/memory_bridge.ts`, so `session_search` can recall past turns.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and add OLLAMA_API_KEY
cp .env.example .env
# edit .env — set OLLAMA_API_KEY and adjust OLLAMA_BASE_URL if needed

# 3. Run the agent dev server
npm run dev
```

The dev server listens on `http://127.0.0.1:2000/` by default.

Interact with the agent via the eve HTTP endpoint:

```bash
curl -X POST http://127.0.0.1:2000/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Hello, what can you do?"}'
```

Attach to the stream:

```bash
curl http://127.0.0.1:2000/eve/v1/session/<sessionId>/stream
```

### Ollama setup

Goldfish is configured to call a local Ollama server:

- Text model: `glm-5.2:cloud` (override with `EVE_MODEL`)
- Vision model: `gemma4:31b-cloud` (override with `OLLAMA_IMAGE_MODEL`)
- Web search: `https://ollama.com/api/web_search`

Required environment variables:

- `OLLAMA_API_KEY` — required for web search; get a key at https://ollama.com/settings/keys.
- `OLLAMA_BASE_URL` — defaults to `http://localhost:11434`.

Make sure your local Ollama server is running and has the requested models pulled:

```bash
ollama pull glm-5.2:cloud
ollama pull gemma4:31b-cloud
```

> **Note on provider compatibility:** eve ships with `ai` v7 (beta). If the
> `ollama/` model prefix does not resolve at runtime, install a compatible
> Ollama provider package that matches your project's `ai` version, or set
> `EVE_MODEL` to a model string your AI SDK setup can resolve.

## Project layout

```
agent/
  agent.ts              # Runtime configuration and model
  instructions.md       # Persistent system identity
  tools/                # Custom tools
  skills/               # Built-in markdown skills
  channels/             # Platform connectors
  connections/          # MCP / API connections
  subagents/            # Specialist child agents
  schedules/            # Recurring review job
  hooks/                # Lifecycle hooks (observability + memory bridge)
lib/                    # Shared helpers (store, config, skills, memory)
evals/                  # Eval cases
tests/                  # Unit tests
```

## Core tools

| Tool | Purpose |
|------|---------|
| `bash` / `read_file` / `write_file` / `glob` / `grep` | Filesystem and shell (eve defaults) |
| `web_fetch` | Fetch web pages (eve default) |
| `web_search` | Web search via the Ollama REST API |
| `analyze_image` | Image understanding via Ollama `gemma4:31b-cloud` |
| `todo` | Durable todo list (eve default) |
| `load_skill` | Load a markdown skill (custom implementation) |
| `memory` | Read/write cross-session memory |
| `skill_manage` | Create / update / list runtime skills |
| `delegate_task` | Record intent to delegate to the `coder` subagent |
| `session_search` | Search persisted conversation history |
| `ask_user` | Pause for human input |
| `browser` | Fetch and summarize web pages |

## Self-improvement

Goldfish learns in three ways:

1. **Explicit memory** — the agent uses the `memory` tool to write facts to `~/.goldfish/memory/MEMORY.md` and user preferences to `USER.md`.
2. **Runtime skills** — the agent uses `skill_manage` to turn repeatable workflows into markdown skills under `~/.goldfish/skills/`.
3. **Scheduled review** — `agent/schedules/review.ts` starts a daily session that prompts the agent to review recent conversations and consolidate them into memory/skills.

## Session persistence

`agent/hooks/memory_bridge.ts` listens to eve stream events and copies user messages, assistant replies, and tool results into the JSON-backed store in `~/.goldfish/sessions/`. This makes `session_search` useful without relying on the framework's internal storage.

## Configuration

Environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama server |
| `OLLAMA_API_KEY` | unset | Required for Ollama web search |
| `OLLAMA_IMAGE_MODEL` | `gemma4:31b-cloud` | Vision model for `analyze_image` |
| `OLLAMA_WEB_SEARCH_URL` | `https://ollama.com/api/web_search` | Ollama web search endpoint |
| `EVE_MODEL` | `ollama/glm-5.2:cloud` | Text model for the agent |
| `GOLDFISH_HOME` | `~/.goldfish` | Local state directory |
| `GOLDFISH_ENABLE_SELF_IMPROVEMENT` | `true` | Enable review schedule |
| `EVE_MCP_URL` | unset | Enable MCP client when set |

## Tests

```bash
npm run typecheck
npm test
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

For production, replace the JSON-backed store with a persistent database (e.g., Vercel Postgres) by implementing the `Store` interface in `lib/store.ts`.

## Sources

- Hermes Agent research: local clone at `../hermes-agent`
- Vercel eve docs: [vercel.com/docs/eve](https://vercel.com/docs/eve)
- Eve TypeScript API: [github.com/vercel/eve](https://github.com/vercel/eve)
- Ollama web search docs: [docs.ollama.com/capabilities/web-search](https://docs.ollama.com/capabilities/web-search)
