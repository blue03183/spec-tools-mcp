[한국어](README.ko.md) | [中文](README.zh.md) | **English** | [日本語](README.ja.md)

# Spec-Tools-MCP

A centralized MCP server that provides spec-driven AI agent skills, rules, and prompts across projects.

AI agents tend to lose context as conversations grow long. Spec-Tools-MCP solves this by keeping all decisions, requirements, and progress in markdown files — not in chat history — so any session can resume exactly where it left off.

## Background

Most spec-based development MCPs store their working files (`plan.md`, `search.md`, `todo.md`, etc.) at a fixed location in the project root. This works fine for a single developer working on one feature at a time, but breaks down quickly when:

- **Multiple developers** are working on different features in the same repository simultaneously
- **Multiple sub-projects** are in flight at once and you need to switch between them or hand off work to a teammate

Because the spec files live at the root level, everything collides — one developer's `todo.md` overwrites another's, `search.md` mixes findings from unrelated features, and it becomes impossible to tell which plan belongs to which work stream.

Spec-Tools-MCP was built specifically for this scenario. Each feature gets its own isolated folder under `ai-spec/projects/<feature>/`, so multiple developers or sub-projects can progress independently in the same repository without interfering with each other. Work can be handed off or resumed by any team member simply by pointing to the right feature folder.

## Usage

Call skills directly from any project via MCP — no file copying required.

#### 1. Install the package in your project

```bash
npm install spec-tools-mcp
```

#### 2. Configure MCP Server

**Option A — Auto-configure (recommended)**

Run the following command in your project root:

```bash
npx spec-tools-mcp init
```

This detects which IDEs are present (Claude Code, Cursor, VS Code) and writes the correct config file for each one automatically. Already-configured entries are skipped.

**Option B — Run with npx (manual)**

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"]
    }
  }
}
```

**Option C — Use local installation path**

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

#### 3. IDE Setup

**VS Code + GitHub Copilot** (`.vscode/mcp.json`) — use Option B or Option C above, or run `npx spec-tools-mcp init`

**Claude Code** (`.mcp.json`):

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"]
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"]
    }
  }
}
```

**Codex** (`.codex/config.toml`):

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp"]
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"]
    }
  }
}
```

**JetBrains** (via MCP Plugin):

Enter the following command in the plugin settings UI:

```
npx -y spec-tools-mcp
```

#### 4. Custom spec directory (optional)

By default, spec files are stored under `ai-spec/` at the project root. To use a different path, set the `SPEC_ROOT_DIR` environment variable:

```json
{
  "mcpServers": {
    "spec-tools-mcp": {
      "command": "npx",
      "args": ["-y", "spec-tools-mcp"],
      "env": { "SPEC_ROOT_DIR": "my-specs" }
    }
  }
}
```

#### 5. Restart & Verify

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

#### 6. How to Use Skills

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

#### 7. Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `spec_init` | Initialize a new feature spec project | `Initialize dashboard with spec_init` |
| `spec_todo` | Analyze planning docs and generate requirement.md · todo.md | `Analyze requirements with spec_todo` |
| `spec_work` | Write a plan for a todo item → approve → implement | `Work on T-01 with spec_work` |
| `get_rules` | Return the contents of spec-development-rules.md | `Show me the development rules` |
| `spec_status` | Show todo progress and pending approvals across all features | `Show current spec status` |
| `spec_handoff` | Generate a handoff document so another developer or session can resume immediately | `Create handoff doc for dashboard` |
| `spec_archive` | Move a completed feature from `projects/` to `archive/` | `Archive the dashboard feature` |
| `spec_search` | Return code locations and symbols from `search.md`; filter by keyword if `query` is provided | `Search for OrderService in dashboard` |

**Tool roles and expected effects**

**`spec_init`**  
Call when starting a new feature. Creates an isolated workspace under `ai-spec/projects/<feature>/` so multiple features or developers can work in the same repository without file conflicts.

**`spec_todo`**  
Run after planning documents are ready. Analyzes files in `docs/`, writes `requirement.md`, and generates self-contained task items in `todo.md` — acting as a human review checkpoint before any implementation begins.

**`spec_work`**  
Use when starting implementation or resuming a prior session. Enforces a plan → approval → code gate: writes `plan.md` first, blocks implementation until a human approves, then records each step in `update.md` so work resumes from exactly where it left off. If any file paths recorded in `search.md` no longer exist, a warning is shown automatically.

**`get_rules`**  
Call when the AI needs to recall the full development protocol. Returns the entire `spec-development-rules.md` to ensure the AI follows the correct spec-driven workflow.

**`spec_status`**  
Use when multiple features are in flight and you need a project-wide view. Shows todo completion rates and all pending plans at a glance, so no approval requests fall through the cracks.

**`spec_handoff`**  
Use when handing off work to a teammate or pausing a feature for an extended period. Compiles goals, todo status, and key code locations into a single document so the next session or developer can resume without re-scanning the codebase.

**`spec_archive`**  
Call once a feature is fully complete. Moves the feature folder to `ai-spec/archive/`, keeping `projects/` clean and limited to active work. Blocked if any todo item is still incomplete.

**`spec_search`**  
Use when you need to look up file locations or symbols cached in `search.md` without opening the file manually. Pass an optional `query` keyword to return only the matching sections. Useful for quickly finding where a class or function was last recorded.

#### 8. Workflow

1. **Initialize** the project with `spec_init`
   - Creates an `ai-spec/projects/{project-name}/` folder with `requirement.md` template and optional `docs/` folder

2. **Upload planning documents** (optional)
   - Copy PDF, images, or other planning files into `ai-spec/projects/{project-name}/docs/`

3. **Run `spec_todo`** to analyze docs and generate spec files
   - Reads docs and writes `requirement.md` — AI asks you to review before continuing
   - For complex features (new APIs, DB schema changes, component architecture), AI writes a `design.md` draft and asks for review before generating tasks
   - Generates `todo.md` with self-contained task items (T-01, T-02, …)
   - If `requirement.md` already exists, analyzed content is appended below existing requirements

4. **Run `spec_work`** to implement each task
   - AI writes `plan.md` for the selected task and asks for your approval
   - You review the plan file directly — no need to describe changes in chat; edit `plan.md` and type `revision done` if changes are needed
   - Type `approved` or `proceed` to start implementation
   - The server enforces the approval gate: if `plan.md` is still `[pending]`, implementation is blocked at the MCP level
   - Progress is recorded in `update.md` as each step completes

5. **Resume anytime** by starting a new session and calling `spec_work` again
   - AI reads `update.md` to find where it left off and continues from there
   - `search.md` caches discovered code locations so the AI doesn't re-scan the codebase on each session

6. Repeat steps 3–4 for each subsequent task

7. **When handing off** work to another developer, request a handoff document
   - `spec_handoff` generates a concise summary of goals, todo status, current progress, and key code locations

8. **When a feature is complete**, archive it to keep `projects/` clean
   - `spec_archive` moves the folder to `ai-spec/archive/` — blocked if any todo is still incomplete

#### 8. Generated Folder Structure

```
ai-spec
├─ templates/                      # (optional) custom templates
│   ├─ requirement.md              # custom requirement template
│   └─ todo.md                     # custom todo template
└─ projects/
    └─ <feature>                   # per-feature project folder
        ├─ requirement.md          # requirements document (Single Source of Truth)
        ├─ design.md               # architecture design document (created for complex features)
        ├─ search.md               # cumulative record of code locations and schemas discovered by AI
        ├─ todo.md                 # task list generated by AI
        ├─ docs/                   # original planning files (PDF, images, etc.)
        └─ <T-number>-<summary>/   # per-task folder
            ├─ plan.md             # design intent, implementation approach, approval status
            └─ update.md           # implementation progress log + review checklist
```

**`search.md` role**: The AI records file locations, schemas, and patterns it discovers here so it doesn't re-scan the codebase from scratch each session. The longer a project runs, the less redundant exploration is needed.

**Custom templates**: Place `ai-spec/templates/requirement.md` or `ai-spec/templates/todo.md` to use your own template format instead of the built-in defaults.

#### 9. Notes

- If your project has a `CLAUDE.md` or `copilot-instructions.md` that describes the folder structure, key file paths, and tech stack, the AI can skip broad codebase exploration and focus immediately on relevant files.
- When context grows too long, AI accuracy can degrade. It is recommended to start a new session for each TODO item. Pass the task number directly (e.g. `spec_work T-02`) to jump straight to that item.

---

## Contributing

Contributions are always welcome! If you find a bug or have a feature request, please [open an issue](https://github.com/blue03183/spec-tools-mcp/issues). Pull requests are also greatly appreciated.

## License

MIT
