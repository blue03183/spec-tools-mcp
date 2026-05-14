[한국어](README.ko.md) | **[中文](README.zh.md)** | [English](README.md) | [日本語](README.ja.md)

# Spec-Tools-MCP

一个集中式 MCP 服务器，为各项目提供规范驱动的 AI 智能体技能、规则和提示词。

AI 智能体在对话变长时往往会丢失上下文。Spec-Tools-MCP 通过将所有决策、需求和进度保存在 Markdown 文件中（而非聊天记录），解决了这一问题——任何会话都能从上次中断的地方精确恢复。

## 背景

大多数基于规范的开发 MCP 将工作文件（`plan.md`、`todo.md` 等）存储在项目根目录的固定位置。这在单人开发单个功能时运行良好，但在以下情况下会迅速失效：

- **多名开发者**在同一仓库中同时开发不同功能
- **多个子项目**并行推进，需要在它们之间切换或将工作移交给团队成员

由于规范文件存放在根目录，一切都会产生冲突——一位开发者的 `todo.md` 会覆盖另一位的，无从判断哪个计划属于哪个工作流。

Spec-Tools-MCP 正是为此而构建的。每个功能在 `ai-spec/projects/<feature>/` 下拥有独立的文件夹，多名开发者或多个子项目可以在同一仓库中独立推进，互不干扰。只需指向对应的功能文件夹，任何团队成员都能移交或恢复工作。

## 使用方法

通过 MCP 从任何项目直接调用技能——无需复制文件。

#### 1. IDE 配置

**Claude Code**

将 MCP 服务器和 Skills 一起作为插件安装：

```sh
/plugin marketplace add blue03183/spec-tools-mcp
/plugin install spec-tools-mcp@spec-tools-mcp-marketplace
```

重启 Claude Code 后生效。使用 `/mcp` 或 `/skills` 确认安装。

---

**VS Code / GitHub Copilot**

> 若要在 Copilot 聊天中直接调用技能，请使用**插件安装**方式。
> 仅安装 MCP 服务器会在工具名称前添加前缀（`blu_`），且无法在聊天面板中直接调用技能。

**作为插件安装**（MCP 服务器 + Skills 一起安装）：

1. 打开 **Command Palette**（`Cmd+Shift+P` / `Ctrl+Shift+P`）
2. 运行 **Chat: Install Plugin From Source**
3. 粘贴：`https://github.com/blue03183/spec-tools-mcp`

<details>
<summary>生成 .vscode/mcp.json</summary>

使用自动配置生成 `.vscode/mcp.json`：

```bash
npx spec-tools-mcp init
```

VS Code 的 MCP 服务器在 `VSCode Extension Host` 中运行，而非终端，因此 `npx` 和 `node` 命令可能无法被识别。
请在 `.vscode/mcp.json` 中明确指定 `command` 和 env `PATH`：

```json
{
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "/Users/{用户名}/.nvm/versions/node/v24.11.0/bin/npx",
      "args": ["-y", "spec-tools-mcp"],
      "env": {
        "PATH": "/Users/{用户名}/.nvm/versions/node/v24.11.0/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

> 在终端运行 `which npx` 获取 npx 路径，运行 `echo $PATH` 获取 PATH 值。

刷新 IDE 窗口后，前往**扩展** → **MCP 服务器 - 已安装**，右键点击 `spec-tools-mcp`，选择**启动服务器**手动启动。

> **注意：** 重新加载 IDE 窗口后需要手动重启服务器（不会自动重启）。

</details>

<details>
<summary>仅安装 MCP 服务器（一键安装，无法直接调用技能）</summary>

[<img src="https://img.shields.io/badge/VS_Code-Install%20MCP%20Server-0098FF?style=flat-square&logo=visualstudiocode" alt="在 VS Code 中安装">](https://vscode.dev/redirect/mcp/install?name=io.github.blue03183%2Fspec-tools-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22spec-tools-mcp%22%5D%2C%22env%22%3A%7B%7D%7D)
[<img src="https://img.shields.io/badge/VS_Code_Insiders-Install%20MCP%20Server-24bfa5?style=flat-square&logo=visualstudiocode" alt="在 VS Code Insiders 中安装">](https://insiders.vscode.dev/redirect?url=vscode-insiders%253Amcp%252Finstall%253F%257B%2522name%2522%253A%2522io.github.blue03183%252Fspec-tools-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522spec-tools-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

</details>

---

**Codex CLI**

通过 CLI 安装：
（如果未安装 Codex CLI，请先安装：`npm install -g @openai/codex`）

```bash
codex mcp add spec-tools-mcp -- npx -y spec-tools-mcp
```

或手动配置（`.codex/config.toml`）：

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp"]
```

> 如果项目配置未生效，请使用 `vi ~/.codex/config.toml` 添加到全局配置。

---

**Cursor / 其他 IDE**

在项目根目录自动配置：

```bash
npx spec-tools-mcp init
```

自动检测 Claude Code、Cursor、VS Code 并为每个 IDE 生成对应的配置文件。

或手动添加到 MCP 配置文件：

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

<details>
<summary>使用本地安装路径</summary>

首先安装包：

```bash
npm install spec-tools-mcp --save-dev
```

然后在配置文件中指定本地路径：

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

#### 2. 自定义规范目录（可选）

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

#### 3. 重启并验证

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

#### 4. 使用技能

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

#### 5. 可用工具

| 工具 | 描述 | 示例 |
|------|------|------|
| `spec_init` | 初始化新功能规范项目 | `用 spec_init 初始化 dashboard` |
| `spec_todo` | 分析规划文档，生成 requirement.md · todo.md | `用 spec_todo 分析需求` |
| `spec_work` | 为 todo 项编写计划 → 审批 → 实现 | `用 spec_work 处理 T-01` |
| `get_rules` | 返回 spec-development-rules.md 的内容 | `显示开发规则` |
| `spec_status` | 显示所有 feature 的 todo 进度和待审批项 | `显示当前规范状态` |
| `spec_handoff` | 生成交接文档，让其他开发者或新会话能立即接手 | `为 dashboard 生成交接文档` |
| `spec_archive` | 将已完成的 feature 从 `projects/` 移至 `archive/` | `归档 dashboard feature` |
| `spec_search` | 从 `_codebase/` 返回代码位置和符号；指定 `query` 时只返回匹配的章节 | `在代码库中搜索 OrderService` |

**工具角色与预期效果**

**`spec_init`**  
新功能开发开始时调用。在 `ai-spec/projects/<feature>/` 下创建独立的工作空间，使多个功能或开发者可以在同一仓库中无文件冲突地协作。同时创建或增量更新项目公共代码库 wiki（`ai-spec/_codebase/`）——首次运行时分析完整代码库，后续运行时仅重新分析自上次同步以来发生变更的文件。

**`spec_todo`**  
规划文档准备就绪后执行。分析 `docs/` 中的文件，生成 `requirement.md` 和包含自包含任务的 `todo.md`——在实现开始前充当人机共同审阅需求的检查点。

**`spec_work`**  
开始实现或接手上一会话时使用。强制执行计划 → 审批 → 实现的门控流程：先写 `plan.md`，人工审批后才能推进。实现开始时，Agent 会立即将 todo 项标记为 `[ ] IN PROGRESS`——即使会话因 token 限制等原因中断，下一个会话也能识别并恢复进行中的任务。每步进展记录到 `update.md`，确保跨会话精确续接。代码位置从 `_codebase/` 读取，无需重新扫描工作区；实现过程中新发现的信息会立即写回 `_codebase/`。

**`get_rules`**  
AI 需要回顾完整开发协议或确认工作方式时调用。返回完整的 `spec-development-rules.md`，确保 AI 遵循正确的规范驱动流程。

**`spec_status`**  
多个功能同时推进、需要全局进度总览时使用。一目了然地显示所有 feature 的 todo 完成率及待审批计划，避免遗漏任何审批请求。

**`spec_handoff`**  
向队友交接工作或需要长期暂停某功能时使用。将功能目标、todo 状态和关键代码位置整合为一份文档，让下一个会话或开发者无需重新扫描代码库即可立即接手。

**`spec_archive`**  
功能完全完成后调用。将 feature 文件夹移至 `ai-spec/archive/`，保持 `projects/` 仅保留活跃工作。若存在未完成的 todo 则会被阻止。

**`spec_search`**  
无需手动打开 `_codebase/` 即可快速查找文件位置或符号。指定 `query` 关键词时，只返回包含该内容的章节。适合快速定位某个类或函数的最新记录位置。

#### 6. 工作流程

1. 使用 `spec_init` **初始化**项目
   - 创建 `ai-spec/projects/{project-name}/` 文件夹，包含 `requirement.md` 模板和可选的 `docs/` 文件夹
   - 创建或更新共享代码库 wiki（`ai-spec/_codebase/`）——首次运行时完整分析，后续运行时仅基于 git 变更进行增量更新

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
   - 实现开始时，Agent 首先将 todo 项标记为 `[ ] IN PROGRESS`——会话中断（如 token 限制）时，下一个会话可以识别并恢复该任务
   - 每个步骤完成时，进度记录在 `update.md` 中

5. 开启新会话并再次调用 `spec_work` 即可**随时恢复**
   - AI 先在 `todo.md` 中查找 `IN PROGRESS` 项并直接跳转到该任务，再从 `update.md` 的第一个未完成项继续
   - `_codebase/` 提供持续积累的代码位置与模式知识，AI 无需每次会话或每个功能都从头扫描代码库

6. 对每个后续任务重复步骤 3–4

7. **移交工作**时请求交接文档
   - `spec_handoff` 生成包含功能目标、todo 状态、当前进度和关键代码位置的简洁文档

8. **功能完成**后归档以保持 `projects/` 整洁
   - `spec_archive` 将文件夹移至 `ai-spec/archive/`——若有未完成的 todo 则会阻止操作

#### 7. 生成的文件夹结构

```
ai-spec
├─ _codebase/                      # 项目公共代码库 wiki（所有功能共享）
│   ├─ index.md                    # 完整目录结构图、技术栈、模块-路径映射表
│   ├─ last-synced.md              # 最后分析时间（git hash + 触发来源）
│   ├─ modules/
│   │   └─ <domain>.md             # 按领域：关键文件、核心 API、模式、依赖关系
│   └─ conventions.md              # 公共约定、命名规则、架构模式
├─ templates/                      # （可选）自定义模板
│   ├─ requirement.md              # 自定义需求模板
│   └─ todo.md                     # 自定义 todo 模板
└─ projects/
    └─ <feature>                   # 每个功能的项目文件夹
        ├─ requirement.md          # 需求文档（唯一可信来源）
        ├─ design.md               # 架构设计文档（复杂功能时创建）
        ├─ todo.md                 # AI 生成的任务列表
        ├─ docs/                   # 原始规划文件（PDF、图片等）
        └─ <T-编号>-<摘要>/        # 每个任务的文件夹
            ├─ plan.md             # 设计意图、实现方案、审批状态
            └─ update.md           # 实现进度日志 + 审阅清单
```

**`_codebase/` 的作用**：AI 在此记录发现的文件位置、schema 和模式，并在所有功能间共享——与按功能缓存不同，知识随时间不断积累。新功能越多、完成的任务越多，冗余探索就越少。

**自定义模板**：添加 `ai-spec/templates/requirement.md` 或 `ai-spec/templates/todo.md`，可使用自定义模板格式替代内置默认值。

#### 8. 注意事项

- `ai-spec/_codebase/` 是持续积累的代码库知识库。通过 `spec_init` 构建一次后，后续所有功能和任务都可直接引用，无需重新扫描工作区——随着项目规模增长，节省的 token 也越来越可观。
- 当上下文过长时，AI 的准确性可能下降。建议为每个 TODO 项开启新会话。直接传入任务编号（如 `spec_work T-02`）可直接跳至该项。

---

## 贡献

欢迎随时贡献！如果您发现了 bug 或有功能建议，请[提交 issue](https://github.com/blue03183/spec-tools-mcp/issues)。同样非常欢迎提交 Pull Request。

## 许可证

MIT
