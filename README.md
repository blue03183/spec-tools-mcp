[한국어](README.ko.md) | [中文](README.zh.md) | **English** | [日本語](README.ja.md)

# Spec-Tools-MCP

A centralized MCP server that provides spec-driven AI agent skills, rules, and prompts across projects.

AI agents tend to lose context as conversations grow long. Spec-Tools-MCP solves this by keeping all decisions, requirements, and progress in markdown files — not in chat history — so any session can resume exactly where it left off.

## Background

Most spec-based development MCPs store their working files (`plan.md`, `todo.md`, etc.) at a fixed location in the project root. This works fine for a single developer working on one feature at a time, but breaks down quickly when:

- **Multiple developers** are working on different features in the same repository simultaneously
- **Multiple sub-projects** are in flight at once and you need to switch between them or hand off work to a teammate

Because the spec files live at the root level, everything collides — one developer's `todo.md` overwrites another's, and it becomes impossible to tell which plan belongs to which work stream.

Spec-Tools-MCP was built specifically for this scenario. Each feature gets its own isolated folder under `ai-spec/projects/<feature>/`, so multiple developers or sub-projects can progress independently in the same repository without interfering with each other. Work can be handed off or resumed by any team member simply by pointing to the right feature folder.

## Usage

Call skills directly from any project via MCP — no file copying required.

#### 1. IDE Setup

**Claude Code**

Install the MCP server and Skills together as a plugin:

```sh
/plugin marketplace add blue03183/spec-tools-mcp
/plugin install spec-tools-mcp@spec-tools-mcp-marketplace
```

Restart Claude Code to activate. Verify with `/mcp` or `/skills`.

---

**VS Code / GitHub Copilot**

> To call skills directly in Copilot chat, use the **plugin install** method.
> Installing only the MCP server adds a prefix (`blu_`) to all tool names and prevents direct skill invocation from the chat panel.

**Install as a plugin** (MCP server + Skills bundled):

1. Open the **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **Chat: Install Plugin From Source**
3. Paste: `https://github.com/blue03183/spec-tools-mcp`

<details>
<summary>Generate .vscode/mcp.json</summary>

Use auto-configure to generate `.vscode/mcp.json`:

```bash
npx spec-tools-mcp init
```

VS Code's MCP server runs inside the `VSCode Extension Host`, not the terminal, so `npx` and `node` may not be recognized.
Explicitly specify `command` and env `PATH` in `.vscode/mcp.json`:

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "/Users/{username}/.nvm/versions/node/v24.11.0/bin/npx",
      "args": ["-y", "spec-tools-mcp@latest"],
      "env": {
        "PATH": "/Users/{username}/.nvm/versions/node/v24.11.0/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

> Run `which npx` to get the npx path, and `echo $PATH` to get the PATH value.

After refreshing the IDE window, go to **Extensions** → **MCP Servers - Installed**, right-click `spec-tools-mcp`, and select **Start Server** to start it manually.

> **Note:** If you reload the IDE window, you must restart the server manually (it does not restart automatically).

</details>

<details>
<summary>MCP server only (one-click, direct skill invocation not available)</summary>

[<img src="https://img.shields.io/badge/VS_Code-Install%20MCP%20Server-0098FF?style=flat-square&logo=visualstudiocode" alt="Install in VS Code">](https://vscode.dev/redirect/mcp/install?name=io.github.blue03183%2Fspec-tools-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22spec-tools-mcp%40latest%22%5D%2C%22env%22%3A%7B%7D%7D)
[<img src="https://img.shields.io/badge/VS_Code_Insiders-Install%20MCP%20Server-24bfa5?style=flat-square&logo=visualstudiocode" alt="Install in VS Code Insiders">](https://insiders.vscode.dev/redirect?url=vscode-insiders%253Amcp%252Finstall%253F%257B%2522name%2522%253A%2522io.github.blue03183%252Fspec-tools-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522spec-tools-mcp%2540latest%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

</details>

---

**Codex CLI**

Install via CLI:
(If Codex CLI is not installed, install it first: `npm install -g @openai/codex`)

```bash
codex mcp add spec-tools-mcp -- npx -y spec-tools-mcp@latest
```

Or configure manually (`.codex/config.toml`):

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp@latest"]
```

> If project settings are not applied, add to global config with `vi ~/.codex/config.toml`.

---

**Cursor / Other IDEs**

Auto-configure from your project root:

```bash
npx spec-tools-mcp init
```

Detects Claude Code, Cursor, and VS Code automatically and writes the correct config file for each.

Or add manually to your MCP config file:

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "spec-tools-mcp@latest"]
    }
  }
}
```

<details>
<summary>Using a local installation path</summary>

First, install the package:

```bash
npm install spec-tools-mcp --save-dev
```

Then reference the local path in your config:

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["./node_modules/spec-tools-mcp/mcp-server/index.js"]
    }
  }
}
```

</details>

#### 2. Custom spec directory (optional)

By default, spec files are stored under `ai-spec/` at the project root. To use a different path, set the `SPEC_ROOT_DIR` environment variable:

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp@latest"],
      "env": { "SPEC_ROOT_DIR": "my-specs" }
    }
  }
}
```

#### 3. Restart & Verify

After adding the MCP configuration, **restart your AI agent** (reload the IDE window or restart the chat session) so the new server is picked up.

**Verify the connection** by asking the AI:

```
What MCP tools are available?
```

Or call `get_rules` directly:

```
get_rules
```

If the server is connected, the AI will list the four tools (`spec_init`, `spec_todo`, `spec_work`, `get_rules`) or return the development rules document.

#### 4. How to Use Skills

Once the MCP server is connected, request skills in natural language from the AI chat.

**VS Code (GitHub Copilot — Agent mode)**

Switch Copilot Chat to Agent mode, then make requests naturally, or use `#` commands to call skills directly:

```
#spec_init dashboard
#spec_todo dashboard
#spec_work T-01
```

**Claude Code (CLI)**

Make requests directly in the Claude Code chat:

```
Initialize dashboard with spec_init
Analyze requirements with spec_todo
Work on T-01 with spec_work
```

#### 5. Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `spec_init` | Initialize a new feature spec project | `Initialize dashboard with spec_init` |
| `spec_todo` | Analyze planning docs and generate requirement.md · todo.md | `Analyze requirements with spec_todo` |
| `spec_work` | Write a plan for a todo item → approve → implement | `Work on T-01 with spec_work` |
| `get_rules` | Return the contents of spec-development-rules.md | `Show me the development rules` |
| `spec_status` | Show todo progress and pending approvals across all features | `Show current spec status` |
| `spec_handoff` | Generate a handoff document so another developer or session can resume immediately | `Create handoff doc for dashboard` |
| `spec_archive` | Move a completed feature from `projects/` to `archive/` | `Archive the dashboard feature` |
| `spec_search` | Return code locations and symbols from `_codebase/`; filter by keyword if `query` is provided | `Search for OrderService in codebase` |

**Tool roles and expected effects**

**`spec_init`**  
Call when starting a new feature. Creates an isolated workspace under `ai-spec/projects/<feature>/` so multiple features or developers can work in the same repository without file conflicts. Also creates or incrementally updates the project-wide codebase wiki at `ai-spec/_codebase/` — on first run it analyzes the full codebase; on subsequent runs it re-analyzes only the files that changed since the last sync.

**`spec_todo`**  
Run after planning documents are ready. Analyzes files in `docs/`, writes `requirement.md`, and generates a simple task list in `todo.md` — acting as a human review checkpoint before any implementation begins.

**`spec_work`**  
Use when starting implementation or resuming a prior session. Enforces a plan → approval → code gate: writes `plan.md` first, blocks implementation until a human approves. When implementation starts, the agent immediately marks the todo item as `[ ] IN PROGRESS` — so even if the session is cut off mid-task (e.g. token limit), the next session can identify and resume the in-progress task. Each step is recorded in `update.md` for fine-grained resumption. Code locations are read from `_codebase/` rather than re-scanning the workspace, and any new findings are written back to `_codebase/` immediately.

**`get_rules`**  
Call when the AI needs to recall the full development protocol. Returns the entire `spec-development-rules.md` to ensure the AI follows the correct spec-driven workflow.

**`spec_status`**  
Use when multiple features are in flight and you need a project-wide view. Shows todo completion rates and all pending plans at a glance, so no approval requests fall through the cracks.

**`spec_handoff`**  
Use when handing off work to a teammate or pausing a feature for an extended period. Compiles goals, todo status, and key code locations into a single document so the next session or developer can resume without re-scanning the codebase.

**`spec_archive`**  
Call once a feature is fully complete. Moves the feature folder to `ai-spec/archive/`, keeping `projects/` clean and limited to active work. Blocked if any todo item is still incomplete.

**`spec_search`**  
Use when you need to look up file locations or symbols cached in `_codebase/` without opening the files manually. Pass an optional `query` keyword to return only the matching sections. Useful for quickly finding where a class or function was last recorded.

#### 6. Workflow

1. **Initialize** the project with `spec_init`
   - Creates an `ai-spec/projects/{project-name}/` folder with `requirement.md` template and optional `docs/` folder
   - Creates or updates the shared codebase wiki at `ai-spec/_codebase/` (full analysis on first run; incremental update on subsequent runs based on git changes)

2. **Upload planning documents** (optional)
   - Copy PDF, images, or other planning files into `ai-spec/projects/{project-name}/docs/`

3. **Run `spec_todo`** to analyze docs and generate spec files
   - Reads docs and writes `requirement.md` — AI asks you to review before continuing
   - If UI changes are included, AI generates a `preview.html` mockup and opens it in a browser for review before generating tasks
   - Generates a simple task list `todo.md` (T-01, T-02, …)
   - If `requirement.md` already exists, analyzed content is appended below existing requirements

4. **Run `spec_work`** to implement each task
   - AI writes `plan.md` for the selected task and asks for your approval
   - You review the plan file directly — to request changes, write your feedback in the `User Feedback` section of `plan.md`, then select `revision needed`
   - Type `approved` or `proceed` to start implementation
   - The server enforces the approval gate: if `plan.md` is still `[pending]`, implementation is blocked at the MCP level
   - As the very first action when implementation starts, the agent marks the todo item `[ ] IN PROGRESS` — if the session is interrupted (e.g. token limit), the next session can detect and resume the in-progress task
   - Progress is recorded in `update.md` as each step completes

5. **Resume anytime** by starting a new session and calling `spec_work` again
   - AI checks `todo.md` for any `IN PROGRESS` item first and jumps directly to that task, then resumes from the first incomplete item in `update.md`
   - `_codebase/` provides accumulated code location and pattern knowledge so the AI doesn't re-scan the codebase from scratch on each session or feature

6. Repeat steps 3–4 for each subsequent task

7. **When handing off** work to another developer, request a handoff document
   - `spec_handoff` generates a concise summary of goals, todo status, current progress, and key code locations

8. **When a feature is complete**, archive it to keep `projects/` clean
   - `spec_archive` moves the folder to `ai-spec/archive/` — blocked if any todo is still incomplete

#### 7. Generated Folder Structure

```
ai-spec
├─ _codebase/                      # project-wide codebase wiki (shared across all features)
│   ├─ index.md                    # full directory map, tech stack, module-path mapping table
│   ├─ last-synced.md              # last analysis timestamp (git hash + trigger)
│   ├─ modules/
│   │   └─ <domain>.md             # per-domain: key files, core APIs, patterns, dependencies
│   └─ conventions.md              # shared conventions, naming rules, architecture patterns
├─ templates/                      # (optional) custom templates
│   ├─ requirement.md              # custom requirement template
│   └─ todo.md                     # custom todo template
└─ projects/
    └─ <feature>                   # per-feature project folder
        ├─ requirement.md          # requirements document (Single Source of Truth)
        ├─ preview.html            # UI mockup (generated when UI changes are included)
        ├─ todo.md                 # task list generated by AI
        ├─ docs/                   # original planning files (PDF, images, etc.)
        └─ <T-number>-<summary>/   # per-task folder
            ├─ plan.md             # design intent, implementation approach, approval status
            └─ update.md           # implementation progress log + review checklist
```

**`_codebase/` role**: The AI records file locations, schemas, and patterns it discovers here — shared across all features. Unlike a per-feature cache, `_codebase/` accumulates knowledge over time: each new feature and each completed task adds to it. The longer a project runs, the less redundant exploration is needed.

**Custom templates**: Place `ai-spec/templates/requirement.md` or `ai-spec/templates/todo.md` to use your own template format instead of the built-in defaults.

#### 8. Notes

- `ai-spec/_codebase/` serves as the persistent codebase knowledge base. Once populated by `spec_init`, subsequent features and tasks reference it instead of re-scanning the workspace — significantly reducing token usage as the project grows.
- When context grows too long, AI accuracy can degrade. It is recommended to start a new session for each TODO item. Pass the task number directly (e.g. `spec_work T-02`) to jump straight to that item.

---

## Updating

When a new version is released, update according to how you installed it.

**Claude Code**

Re-run the install commands to replace the current version with the latest.

```sh
/plugin marketplace add blue03183/spec-tools-mcp
/plugin install spec-tools-mcp@spec-tools-mcp-marketplace
```

**VS Code / GitHub Copilot (plugin)**

Follow the same steps as the initial installation. The existing plugin will be replaced with the latest version.

1. Open the **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **Chat: Install Plugin From Source**
3. Paste the same URL: `https://github.com/blue03183/spec-tools-mcp`

**npx-based setups (Codex CLI, Cursor, other IDEs)**

Configurations using `npx -y` automatically fetch the latest version each time the server starts. No manual action needed.

If an older cached version persists, refresh it with:

```bash
npx --yes spec-tools-mcp@latest
```

**Local install (`npm install --save-dev`)**

```bash
npm update spec-tools-mcp
```

After updating, restart your AI agent.

---

## Contributing

Contributions are always welcome! If you find a bug or have a feature request, please [open an issue](https://github.com/blue03183/spec-tools-mcp/issues). Pull requests are also greatly appreciated.

## License

MIT
