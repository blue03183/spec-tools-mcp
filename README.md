# Spec-Tools-MCP

A centralized MCP server that provides spec-driven AI agent skills, rules, and prompts across projects.

## Usage

Call skills directly from any project via MCP — no file copying required.

#### 1. Install the package in your project

```bash
npm install spec-tools-mcp
```

#### 2. Configure MCP Server

**Option A — Run with npx (no local install required)**

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

**Option B — Use local installation path**

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

**VS Code** (`.vscode/mcp.json`) — use Option A or Option B above

**Claude Code** (`.claude/settings.json`):

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

#### 4. How to Use Skills

Once the MCP server is connected, request skills in natural language from the AI chat. Examples for each environment:

**VS Code (GitHub Copilot — Agent mode)**

Switch Copilot Chat to Agent mode, then make requests naturally:

```
Initialize the seller-dashboard project       → calls spec_init
Analyze requirements and generate todo        → calls spec_todo
Work on T-01                                  → calls spec_work
Show me the development rules                 → calls get_rules
```

**Claude Code (CLI)**

Make requests directly in the Claude Code chat:

```
Initialize seller-dashboard with spec_init
Analyze requirements with spec_todo
Work on T-01 with spec_work
```

#### 5. Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `spec_init` | Initialize a new feature spec project | `Initialize seller-dashboard with spec_init` |
| `spec_todo` | Analyze planning docs and generate requirement.md · todo.md | `Analyze requirements with spec_todo` |
| `spec_work` | Write a plan for a todo item → approve → implement | `Work on T-01 with spec_work` |
| `get_rules` | Return the contents of spec-development-rules.md | `Show me the development rules` |

#### 6. Workflow

1. Initialize the project with `spec_init`
   - Creates an `ai-spec` folder at the project root with initial files
2. If you have planning documents for requirements analysis, upload them to `ai-spec/projects/{project-name}/docs`
   - These files will be analyzed by `spec_todo` to derive requirements and tasks
   - If you have requirements to write in advance, add them to `ai-spec/projects/{project-name}/requirement.md`
3. Run `spec_todo` to analyze docs and generate requirement.md · todo.md
   - If requirement.md already exists, the analyzed content is appended below the existing requirements
4. Run `spec_work` to write a plan for each todo item → approve → implement
   - Plans are written to `ai-spec/projects/{project-name}/{task-id}/plan.md`
   - Once the user reviews and approves the plan, implementation begins
   - Completed task progress is recorded in `ai-spec/projects/{project-name}/{task-id}/update.md`
5. Repeat steps 3–4 for each subsequent task
