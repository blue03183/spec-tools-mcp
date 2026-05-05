[한국어](README.ko.md) | **[中文](README.zh.md)** | [English](README.md) | [日本語](README.ja.md)

# Spec-Tools-MCP

一个集中式 MCP 服务器，为各项目提供规范驱动的 AI 智能体技能、规则和提示词。

AI 智能体在对话变长时往往会丢失上下文。Spec-Tools-MCP 通过将所有决策、需求和进度保存在 Markdown 文件中（而非聊天记录），解决了这一问题——任何会话都能从上次中断的地方精确恢复。

## 背景

大多数基于规范的开发 MCP 将工作文件（`plan.md`、`search.md`、`todo.md` 等）存储在项目根目录的固定位置。这在单人开发单个功能时运行良好，但在以下情况下会迅速失效：

- **多名开发者**在同一仓库中同时开发不同功能
- **多个子项目**并行推进，需要在它们之间切换或将工作移交给团队成员

由于规范文件存放在根目录，一切都会产生冲突——一位开发者的 `todo.md` 会覆盖另一位的，`search.md` 混入了不相关功能的发现内容，无从判断哪个计划属于哪个工作流。

Spec-Tools-MCP 正是为此而构建的。每个功能在 `ai-spec/projects/<feature>/` 下拥有独立的文件夹，多名开发者或多个子项目可以在同一仓库中独立推进，互不干扰。只需指向对应的功能文件夹，任何团队成员都能移交或恢复工作。

## 使用方法

通过 MCP 从任何项目直接调用技能——无需复制文件。

#### 1. 在项目中安装包

```bash
npm install spec-tools-mcp
```

#### 2. 配置 MCP 服务器

**选项 A — 自动配置（推荐）**

在项目根目录运行以下命令：

```bash
npx spec-tools-mcp init
```

自动检测当前项目使用的 IDE（Claude Code、Cursor、VS Code），并为每个 IDE 生成对应的配置文件。已配置的条目会自动跳过。

**选项 B — 使用 npx 运行（手动）**

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

**选项 C — 使用本地安装路径**

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

#### 3. IDE 配置

**VS Code + GitHub Copilot**（`.vscode/mcp.json`）——使用上方选项 B 或 C，或运行 `npx spec-tools-mcp init`

**Claude Code**（`.mcp.json`）：

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

**Claude Desktop**（`claude_desktop_config.json`）：

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

**Codex**（`.codex/config.toml`）：

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp"]
```

**Cursor**（`.cursor/mcp.json`）：

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

**JetBrains**（通过 MCP 插件）：

在插件设置界面中输入以下命令：

```
npx -y spec-tools-mcp
```

#### 4. 自定义规范目录（可选）

默认情况下，规范文件存储在项目根目录的 `ai-spec/` 下。若要使用其他路径，请设置 `SPEC_ROOT_DIR` 环境变量：

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

#### 5. 重启并验证

添加 MCP 配置后，**重启 AI 智能体**（重新加载 IDE 窗口或重启聊天会话）以使新服务器生效。

通过向 AI 提问来**验证连接**：

```
有哪些可用的 MCP 工具？
```

或直接调用 `get_rules`：

```
get_rules
```

如果服务器已连接，AI 将列出四个工具（`spec_init`、`spec_todo`、`spec_work`、`get_rules`）或返回开发规则文档。

#### 6. 使用技能

MCP 服务器连接后，在 AI 聊天中用自然语言请求技能。

**VS Code（GitHub Copilot — 智能体模式）**

将 Copilot Chat 切换至智能体模式，然后自然地发出请求，或使用 `#` 命令直接调用技能：

```
#spec_init dashboard
#spec_todo dashboard
#spec_work T-01
```

**Claude Code（CLI）**

在 Claude Code 聊天中直接发出请求：

```
用 spec_init 初始化 dashboard
用 spec_todo 分析需求
用 spec_work 处理 T-01
```

#### 7. 可用工具

| 工具 | 描述 | 示例 |
|------|------|------|
| `spec_init` | 初始化新功能规范项目 | `用 spec_init 初始化 dashboard` |
| `spec_todo` | 分析规划文档，生成 requirement.md · todo.md | `用 spec_todo 分析需求` |
| `spec_work` | 为 todo 项编写计划 → 审批 → 实现 | `用 spec_work 处理 T-01` |
| `get_rules` | 返回 spec-development-rules.md 的内容 | `显示开发规则` |
| `spec_status` | 显示所有 feature 的 todo 进度和待审批项 | `显示当前规范状态` |
| `spec_handoff` | 生成交接文档，让其他开发者或新会话能立即接手 | `为 dashboard 生成交接文档` |
| `spec_archive` | 将已完成的 feature 从 `projects/` 移至 `archive/` | `归档 dashboard feature` |
| `spec_search` | 从 `search.md` 返回代码位置和符号；指定 `query` 时只返回匹配的章节 | `在 dashboard 中搜索 OrderService` |

**工具角色与预期效果**

**`spec_init`**  
新功能开发开始时调用。在 `ai-spec/projects/<feature>/` 下创建独立的工作空间，使多个功能或开发者可以在同一仓库中无文件冲突地协作。

**`spec_todo`**  
规划文档准备就绪后执行。分析 `docs/` 中的文件，生成 `requirement.md` 和包含自包含任务的 `todo.md`——在实现开始前充当人机共同审阅需求的检查点。

**`spec_work`**  
开始实现或接手上一会话时使用。强制执行计划 → 审批 → 实现的门控流程：先写 `plan.md`，人工审批后才能推进，并将每步进展记录到 `update.md`，确保跨会话精确续接。若 `search.md` 中记录的路径已不存在，会自动显示警告。

**`get_rules`**  
AI 需要回顾完整开发协议或确认工作方式时调用。返回完整的 `spec-development-rules.md`，确保 AI 遵循正确的规范驱动流程。

**`spec_status`**  
多个功能同时推进、需要全局进度总览时使用。一目了然地显示所有 feature 的 todo 完成率及待审批计划，避免遗漏任何审批请求。

**`spec_handoff`**  
向队友交接工作或需要长期暂停某功能时使用。将功能目标、todo 状态和关键代码位置整合为一份文档，让下一个会话或开发者无需重新扫描代码库即可立即接手。

**`spec_archive`**  
功能完全完成后调用。将 feature 文件夹移至 `ai-spec/archive/`，保持 `projects/` 仅保留活跃工作。若存在未完成的 todo 则会被阻止。

**`spec_search`**  
无需手动打开 `search.md` 即可快速查找文件位置或符号。指定 `query` 关键词时，只返回包含该内容的章节。适合快速定位某个类或函数的最新记录位置。

#### 8. 工作流程

1. 使用 `spec_init` **初始化**项目
   - 创建 `ai-spec/projects/{project-name}/` 文件夹，包含 `requirement.md` 模板和可选的 `docs/` 文件夹

2. **上传规划文档**（可选）
   - 将 PDF、图片或其他规划文件复制到 `ai-spec/projects/{project-name}/docs/`

3. **运行 `spec_todo`** 分析文档并生成规范文件
   - 读取文档并编写 `requirement.md`——AI 会在继续前请你审阅
   - 对于复杂功能（新 API、DB schema 变更、组件架构），AI 会编写 `design.md` 草案并在生成任务前请求审阅
   - 生成包含自包含任务项的 `todo.md`（T-01、T-02……）
   - 若 `requirement.md` 已存在，分析内容将追加到现有需求下方

4. **运行 `spec_work`** 实现每个任务
   - AI 为选定任务编写 `plan.md` 并请求审批
   - 直接审阅计划文件——无需在聊天中描述变更；编辑 `plan.md` 后输入 `修改完成` 即可
   - 输入 `审批` 或 `继续` 开始实现
   - 审批门控在 MCP 服务器层强制执行：若 `plan.md` 仍为 `[待审批]` 状态，实现将被阻止
   - 每个步骤完成时，进度记录在 `update.md` 中

5. 开启新会话并再次调用 `spec_work` 即可**随时恢复**
   - AI 读取 `update.md` 找到中断位置并从那里继续
   - `search.md` 缓存已发现的代码位置，AI 无需每次会话都重新扫描代码库

6. 对每个后续任务重复步骤 3–4

7. **移交工作**时请求交接文档
   - `spec_handoff` 生成包含功能目标、todo 状态、当前进度和关键代码位置的简洁文档

8. **功能完成**后归档以保持 `projects/` 整洁
   - `spec_archive` 将文件夹移至 `ai-spec/archive/`——若有未完成的 todo 则会阻止操作

#### 9. 生成的文件夹结构

```
ai-spec
├─ templates/                      # （可选）自定义模板
│   ├─ requirement.md              # 自定义需求模板
│   └─ todo.md                     # 自定义 todo 模板
└─ projects/
    └─ <feature>                   # 每个功能的项目文件夹
        ├─ requirement.md          # 需求文档（唯一可信来源）
        ├─ design.md               # 架构设计文档（复杂功能时创建）
        ├─ search.md               # AI 发现的代码位置和 schema 的累计记录
        ├─ todo.md                 # AI 生成的任务列表
        ├─ docs/                   # 原始规划文件（PDF、图片等）
        └─ <T-编号>-<摘要>/        # 每个任务的文件夹
            ├─ plan.md             # 设计意图、实现方案、审批状态
            └─ update.md           # 实现进度日志 + 审阅清单
```

**`search.md` 的作用**：AI 在此记录发现的文件位置、schema 和模式，避免每次会话都从头扫描代码库。项目进行得越久，冗余探索就越少。

**自定义模板**：添加 `ai-spec/templates/requirement.md` 或 `ai-spec/templates/todo.md`，可使用自定义模板格式替代内置默认值。

#### 10. 注意事项

- 如果项目有 `CLAUDE.md` 或 `copilot-instructions.md` 描述了文件夹结构、关键文件路径和技术栈，AI 可跳过大范围的代码库探索，直接聚焦于相关文件。
- 当上下文过长时，AI 的准确性可能下降。建议为每个 TODO 项开启新会话。直接传入任务编号（如 `spec_work T-02`）可直接跳至该项。

---

## 贡献

欢迎随时贡献！如果您发现了 bug 或有功能建议，请[提交 issue](https://github.com/blue03183/spec-tools-mcp/issues)。同样非常欢迎提交 Pull Request。

## 许可证

MIT
