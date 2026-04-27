# Spec-Tools-MCP

A centralized MCP server that provides spec-driven AI agent skills, rules, and prompts across projects.

## Usage

Call skills directly from any project via MCP — no file copying required.

#### 1. Install the package in your project

```bash
npm install spec-tools-mcp
```

#### 2. Configure `.vscode/mcp.json`

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

#### 3. Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `spec_init` | Initialize a new feature spec project | `#spec_init seller-dashboard` |
| `spec_todo` | Analyze planning docs and generate requirement.md · todo.md | `#spec_todo seller-dashboard` |
| `spec_work` | Write a plan for a todo item → approve → implement | `#spec_work seller-dashboard T-01` |
| `get_rules` | Return the contents of spec-development-rules.md | `#get_rules` |

#### 4. Workflow

1. Initialize the project with `spec_init`
   - Creates an `ai-spec` folder at the project root with initial files
2. If you have planning documents for requirements analysis, upload them to `ai-spec/projects/{project-name}/docs`
   - These files will be analyzed by `spec_todo` to derive requirements and tasks
   - If you have requirements to write in advance, add them to `ai-spec/projects/{project-name}/requirement.md`
3. Run `spec_todo` to analyze docs and generate requirement.md · todo.md
   - If requirement.md already exists, the analyzed content is appended below the existing requirements
4. Run `spec_work` to write a plan for each todo item → approve → implement
   - Plans are written to `ai-spec/projects/{project-name}/plans/{task-id}/plan.md`
   - Once the user reviews and approves the plan, implementation begins
   - Research notes gathered during implementation are saved to `ai-spec/projects/{project-name}/plans/{task-id}/search.md` and referenced throughout the task
   - Completed task plans are updated in `ai-spec/projects/{project-name}/{task-id}/update.md`
5. Repeat steps 3–4 for each subsequent task
