#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(KIT_ROOT, "skills");
const RULES_DIR = path.join(KIT_ROOT, "rules");
const SPEC_ROOT_DIR: string = process.env.SPEC_ROOT_DIR ?? "ai-spec";
const PKG_VERSION: string = fs.readJsonSync(path.join(KIT_ROOT, "package.json")).version;

interface CacheEntry { content: string; mtimeMs: number; }
const fileCache = new Map<string, CacheEntry>();

async function cachedRead(filePath: string): Promise<string> {
  const stat = await fs.stat(filePath);
  const cached = fileCache.get(filePath);
  if (cached !== undefined && cached.mtimeMs === stat.mtimeMs) return cached.content;
  const content: string = await fs.readFile(filePath, "utf-8");
  fileCache.set(filePath, { content, mtimeMs: stat.mtimeMs });
  return content;
}

function buildPrefix(label: string): string {
  return `> **[SPEC_ROOT_DIR]** 스펙 파일 루트 경로: \`${SPEC_ROOT_DIR}\`\n> ${label} 내 \`ai-spec/\` 경로가 나오면 이 값으로 대체하여 사용하세요.\n\n`;
}

async function readSkillText(skillName: string): Promise<string> {
  const skillPath = path.join(SKILLS_DIR, skillName, "SKILL.md");
  const raw = await cachedRead(skillPath);
  const content = SPEC_ROOT_DIR !== "ai-spec"
    ? raw.replaceAll("ai-spec/", `${SPEC_ROOT_DIR}/`)
    : raw;
  return buildPrefix("SKILL.md") + content;
}

async function readSkill(skillName: string) {
  return { content: [{ type: "text" as const, text: await readSkillText(skillName) }] };
}

// ── 파일시스템 헬퍼 ──────────────────────────────────────────────────────────

function specProjectsPath(): string {
  return path.resolve(process.cwd(), SPEC_ROOT_DIR, "projects");
}

interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  inProgress: boolean;
}

function parseTodos(content: string): TodoItem[] {
  const items: TodoItem[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+\[(T-\d+[E]?)\]\s+(.+)/);
    if (!m) continue;
    const id = m[1];
    const title = m[2].trim();
    let done = false;
    let inProgress = false;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      if (lines[j].startsWith("##")) break;
      if (/상태:.*\[x\]/.test(lines[j])) { done = true; break; }
      if (/상태:.*IN PROGRESS/.test(lines[j])) { inProgress = true; break; }
    }
    items.push({ id, title, done, inProgress });
  }
  return items;
}

async function findPlanMd(featDir: string, todoId: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(featDir);
    const match = entries.find(e => e.startsWith(`${todoId}-`));
    if (!match) return null;
    const planPath = path.join(featDir, match, "plan.md");
    return (await fs.pathExists(planPath)) ? planPath : null;
  } catch {
    return null;
  }
}

async function readApprovalStatus(planPath: string): Promise<string | null> {
  try {
    const lines = (await fs.readFile(planPath, "utf-8")).split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes("Approval Status")) continue;
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const t = lines[j].trim();
        if (t) return t;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function findUpdateMd(featDir: string, todoId: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(featDir);
    const match = entries.find(e => e.startsWith(`${todoId}-`));
    if (!match) return null;
    const updatePath = path.join(featDir, match, "update.md");
    return (await fs.pathExists(updatePath)) ? updatePath : null;
  } catch {
    return null;
  }
}

interface Section { heading: string; body: string; }

// 마크다운 본문을 헤딩(`#`~`######`) 단위 섹션으로 분할한다.
function splitSections(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let current: Section = { heading: "", body: "" };
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      if (current.heading || current.body.trim()) sections.push(current);
      current = { heading: line, body: "" };
    } else {
      current.body += line + "\n";
    }
  }
  if (current.heading || current.body.trim()) sections.push(current);
  return sections;
}

// _codebase/ 위키 파일 목록을 수집한다. (index → conventions → gotchas → modules/*)
async function collectCodebaseFiles(codebaseDir: string): Promise<string[]> {
  const files: string[] = [];
  for (const name of ["index.md", "conventions.md", "gotchas.md"]) {
    const p = path.join(codebaseDir, name);
    if (await fs.pathExists(p)) files.push(p);
  }
  const modulesDir = path.join(codebaseDir, "modules");
  if (await fs.pathExists(modulesDir)) {
    const entries = await fs.readdir(modulesDir);
    for (const e of entries.filter((e) => e.endsWith(".md")).sort()) {
      files.push(path.join(modulesDir, e));
    }
  }
  return files;
}

// ── 서버 ──────────────────────────────────────────────────────────────────────

export function createServer() {
  const server = new McpServer({
    name: "spec-tools-mcp",
    version: PKG_VERSION,
  });

  // ── 기존 도구 ──────────────────────────────────────────────────────────────

  server.tool(
    "spec_init",
    "Spec-Driven Development를 위한 프로젝트 초기화. ai-spec/projects/<feature> 폴더 구조와 requirement.md 를 생성한다.",
    {
      feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 인터뷰한다."),
    },
    async () => readSkill("spec-init")
  );

  server.tool(
    "spec_todo",
    "docs/ 기획서를 분석하여 requirement.md 를 작성·보완하고 todo.md 를 생성한다.",
    {
      feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 목록을 확인한다."),
    },
    async () => readSkill("spec-todo")
  );

  server.tool(
    "spec_work",
    "todo.md 항목을 plan.md 작성 → 승인 → 구현 → 완료 보고 순으로 실행한다.",
    {
      feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 목록을 확인한다."),
      todo: z.string().optional().describe("진행할 todo 번호 (예: T-01). 생략 시 첫 번째 미완료 항목을 선택한다."),
    },
    async ({ feature, todo }) => {
      const skillText = await readSkillText("spec-work");
      let prefix = "";

      if (feature) {
        const featDir = path.join(specProjectsPath(), feature);
        if (todo) {
          const todoId = todo.toUpperCase();

          // E2E 항목(T-NNE)은 대응 구현 항목(T-NN) 완료 후에만 진행한다.
          if (/^T-\d+E$/.test(todoId)) {
            const baseId = todoId.slice(0, -1);
            const todoPath = path.join(featDir, "todo.md");
            if (await fs.pathExists(todoPath)) {
              const base = parseTodos(await fs.readFile(todoPath, "utf-8")).find((t) => t.id === baseId);
              if (base && !base.done) {
                prefix += `> ⚠️ **E2E 선행 조건 미충족**: \`${todoId}\` 는 \`${baseId}\` 구현이 완료된 후 진행해야 합니다. 현재 \`${baseId}\` 는 미완료 상태입니다.\n> 먼저 \`${baseId}\` 를 완료하세요.\n\n`;
              }
            }
          }

          const planPath = await findPlanMd(featDir, todoId);

          if (planPath) {
            const status = await readApprovalStatus(planPath);
            const rel = path.relative(process.cwd(), planPath);

            if (status === "[대기]") {
              const block = [
                `# ⛔ 구현 차단 — 승인 대기`,
                ``,
                `\`${todoId}\` 의 plan.md 가 **[대기]** 상태입니다. 승인 전에는 구현 절차가 제공되지 않으며, 어떤 구현 코드도 작성하지 않습니다.`,
                `경로: \`${rel}\``,
                ``,
                `## 사용자에게 다음을 안내하세요`,
                `- **승인**: plan.md 를 검토한 뒤 채팅에 "승인"(또는 "진행해")을 입력하거나 Approval Status 를 \`[승인]\` 으로 직접 변경`,
                `- **수정**: plan.md 의 User Feedback 섹션에 수정 내용을 적고 "수정" 으로 응답`,
                ``,
                `## "수정" 응답을 받은 경우에만 수행`,
                `1. 기존 plan.md 와 User Feedback 섹션을 읽어 수정 요청을 파악한다.`,
                `2. plan.md 를 수정 요청에 맞게 재작성한다. (구현 코드는 작성하지 않는다)`,
                `3. Approval Status 를 \`[대기]\` 로 유지하고 다시 승인을 요청한다.`,
                ``,
                `승인이 확인되면 \`spec_work feature=${feature} todo=${todoId}\` 를 다시 호출하세요. 그때 구현 절차가 제공됩니다.`,
              ].join("\n");
              return { content: [{ type: "text" as const, text: prefix + block }] };
            }
            if (status === "[승인]") {
              prefix += `> ✅ **승인 확인**: \`${todoId}\` plan.md 가 **[승인]** 상태입니다. 구현을 진행합니다.\n\n`;
              return { content: [{ type: "text" as const, text: prefix + skillText }] };
            }
          }
        }
      }

      return { content: [{ type: "text" as const, text: prefix + skillText }] };
    }
  );

  server.tool(
    "get_rules",
    "spec-development-rules.md 내용을 반환합니다.",
    {},
    async () => {
      const rulesPath = path.join(RULES_DIR, "spec-development-rules.md");
      const raw = await cachedRead(rulesPath);
      const content = SPEC_ROOT_DIR !== "ai-spec"
        ? raw.replaceAll("ai-spec/", `${SPEC_ROOT_DIR}/`)
        : raw;
      return { content: [{ type: "text" as const, text: buildPrefix("규칙") + content }] };
    }
  );

  // ── 신규 도구 ──────────────────────────────────────────────────────────────

  server.tool(
    "spec_status",
    "모든 feature의 todo 진행 현황과 승인 대기 항목을 요약하여 반환한다.",
    {
      feature: z.string().optional().describe("특정 feature 현황만 볼 경우 폴더명을 지정"),
    },
    async ({ feature }) => {
      const projectsDir = specProjectsPath();

      let features: string[] = [];
      if (feature) {
        features = [feature];
      } else {
        try {
          const entries = await fs.readdir(projectsDir);
          const results = await Promise.all(
            entries.map(async (e) => ({
              name: e,
              isDir: (await fs.stat(path.join(projectsDir, e))).isDirectory(),
            }))
          );
          features = results.filter((r) => r.isDir).map((r) => r.name);
        } catch {
          return { content: [{ type: "text" as const, text: `❌ \`${SPEC_ROOT_DIR}/projects/\` 폴더를 찾을 수 없습니다.` }] };
        }
      }

      if (features.length === 0) {
        return { content: [{ type: "text" as const, text: "진행 중인 feature가 없습니다." }] };
      }

      let report = `# Spec 현황\n\n`;

      for (const feat of features) {
        const featDir = path.join(projectsDir, feat);
        report += `## ${feat}\n`;

        const todoPath = path.join(featDir, "todo.md");
        if (await fs.pathExists(todoPath)) {
          const todos = parseTodos(await fs.readFile(todoPath, "utf-8"));
          const done = todos.filter((t) => t.done);
          const inProgressItems = todos.filter((t) => !t.done && t.inProgress);
          const waiting = todos.filter((t) => !t.done && !t.inProgress);

          report += `- 진행률: ${done.length}/${todos.length} 완료\n`;

          if (done.length === todos.length) {
            report += `- ✅ 모든 작업 완료 (${todos.length}개)\n`;
          } else {
            if (inProgressItems.length > 0) {
              report += `- 진행 중: ${inProgressItems.map((t) => t.id).join(", ")}\n`;
            }
            if (waiting.length > 0) {
              report += `- 대기: ${waiting.map((t) => t.id).join(", ")}\n`;
            }

            const pendingApprovals: string[] = [];
            for (const todo of [...inProgressItems, ...waiting]) {
              const planPath = await findPlanMd(featDir, todo.id);
              if (planPath) {
                const status = await readApprovalStatus(planPath);
                if (status === "[대기]") {
                  pendingApprovals.push(`${todo.id}(승인 대기)`);
                }
              }
            }
            if (pendingApprovals.length > 0) {
              report += `- 승인 필요: ${pendingApprovals.join(", ")}\n`;
            }
          }
        } else {
          report += `- todo.md 없음\n`;
        }

        report += "\n";
      }

      return { content: [{ type: "text" as const, text: report }] };
    }
  );

  server.tool(
    "spec_handoff",
    "feature의 현재 상태를 요약한 인계 문서를 생성한다. 다른 개발자나 새 세션이 바로 작업을 이어받을 수 있도록 핵심 정보를 정리한다.",
    {
      feature: z.string().describe("인계할 feature 폴더명"),
    },
    async ({ feature }) => {
      const featDir = path.join(specProjectsPath(), feature);

      if (!(await fs.pathExists(featDir))) {
        return { content: [{ type: "text" as const, text: `❌ feature \`${feature}\` 폴더를 찾을 수 없습니다.` }] };
      }

      let doc = `# [${feature}] 인계 문서\n\n`;

      // 기능 목표
      const reqPath = path.join(featDir, "requirement.md");
      if (await fs.pathExists(reqPath)) {
        const reqContent = await fs.readFile(reqPath, "utf-8");
        const goalMatch = reqContent.match(/##\s*기능 목표\n([\s\S]*?)(?=\n##|$)/);
        if (goalMatch) {
          doc += `## 기능 목표\n${goalMatch[1].trim()}\n\n`;
        }
      }

      // todo 현황
      const todoPath = path.join(featDir, "todo.md");
      if (await fs.pathExists(todoPath)) {
        const todos = parseTodos(await fs.readFile(todoPath, "utf-8"));
        const done = todos.filter((t) => t.done);
        const pending = todos.filter((t) => !t.done);

        doc += `## 진행 현황 (${done.length}/${todos.length} 완료)\n`;
        if (done.length > 0) {
          doc += `- ✅ 완료: ${done.map((t) => `${t.id} ${t.title}`).join(", ")}\n`;
        }
        if (pending.length > 0) {
          doc += `- ⏳ 미완료: ${pending.map((t) => `${t.id} ${t.title}`).join(", ")}\n`;
        }
        doc += "\n";

        // 현재 진행 중인 todo의 update.md
        for (const todo of pending) {
          const updatePath = await findUpdateMd(featDir, todo.id);
          if (updatePath) {
            const updateContent = await fs.readFile(updatePath, "utf-8");
            const listMatch = updateContent.match(/##\s*작업 목록\n([\s\S]*?)(?=\n##|$)/);
            if (listMatch) {
              doc += `## 현재 작업 중 (${todo.id}: ${todo.title})\n`;
              doc += listMatch[1].trim() + "\n\n";
            }
            break;
          }
        }

        // 다음 작업
        if (pending.length > 0) {
          const next = pending[0];
          doc += `## 다음 작업\n\`spec_work feature=${feature} todo=${next.id}\`\n\n`;
        }
      }

      return { content: [{ type: "text" as const, text: doc }] };
    }
  );

  server.tool(
    "spec_archive",
    "완료된 feature를 ai-spec/archive/ 로 이동하여 보관한다. 미완료 todo가 있으면 force=true 를 지정해야 한다.",
    {
      feature: z.string().describe("아카이브할 feature 폴더명"),
      force: z.boolean().optional().describe("미완료 todo가 있어도 강제 아카이브 (기본값: false)"),
    },
    async ({ feature, force = false }) => {
      const featDir = path.join(specProjectsPath(), feature);

      if (!(await fs.pathExists(featDir))) {
        return { content: [{ type: "text" as const, text: `❌ feature \`${feature}\` 폴더를 찾을 수 없습니다.` }] };
      }

      const todoPath = path.join(featDir, "todo.md");
      if (await fs.pathExists(todoPath)) {
        const todos = parseTodos(await fs.readFile(todoPath, "utf-8"));
        const pending = todos.filter((t) => !t.done);
        if (pending.length > 0 && !force) {
          return {
            content: [{
              type: "text" as const,
              text: `❌ 아카이브 불가: 미완료 todo 가 ${pending.length}개 있습니다.\n미완료: ${pending.map((t) => t.id).join(", ")}\n\n강제 아카이브가 필요하면 \`force=true\` 를 추가하세요.`,
            }],
          };
        }
      }

      const archiveDir = path.resolve(process.cwd(), SPEC_ROOT_DIR, "archive");
      const archiveDest = path.join(archiveDir, feature);

      await fs.ensureDir(archiveDir);

      if (await fs.pathExists(archiveDest)) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ 아카이브 불가: \`${SPEC_ROOT_DIR}/archive/${feature}/\` 폴더가 이미 존재합니다.\n기존 아카이브를 삭제하거나 폴더명을 변경한 후 다시 시도하세요.`,
          }],
        };
      }

      await fs.move(featDir, archiveDest);

      return {
        content: [{
          type: "text" as const,
          text: `✅ \`${feature}\` 아카이브 완료\n\n이동: \`${SPEC_ROOT_DIR}/projects/${feature}/\` → \`${SPEC_ROOT_DIR}/archive/${feature}/\``,
        }],
      };
    }
  );

  server.tool(
    "spec_search",
    "ai-spec/_codebase/ 에 기록된 코드 위치·심볼·패턴을 반환한다. query 지정 시 해당 키워드가 포함된 섹션만 필터링한다.",
    {
      query: z.string().optional().describe("검색 키워드 (심볼명, 파일 경로 등). 생략 시 전체 위키를 반환한다."),
    },
    async ({ query }) => {
      const codebaseDir = path.resolve(process.cwd(), SPEC_ROOT_DIR, "_codebase");

      if (!(await fs.pathExists(codebaseDir))) {
        return { content: [{ type: "text" as const, text: `❌ \`${SPEC_ROOT_DIR}/_codebase/\` 폴더를 찾을 수 없습니다. 먼저 \`spec_init\` 으로 코드베이스 위키를 생성하세요.` }] };
      }

      const files = await collectCodebaseFiles(codebaseDir);
      if (files.length === 0) {
        return { content: [{ type: "text" as const, text: `❌ \`${SPEC_ROOT_DIR}/_codebase/\` 에 위키 파일이 없습니다.` }] };
      }

      if (!query) {
        let out = "";
        for (const f of files) {
          const rel = path.relative(process.cwd(), f);
          out += `\n\n===== ${rel} =====\n` + (await fs.readFile(f, "utf-8")).trimEnd();
        }
        return { content: [{ type: "text" as const, text: out.trim() }] };
      }

      const needle = query.toLowerCase();
      let out = "";
      for (const f of files) {
        const content = await fs.readFile(f, "utf-8");
        const matched = splitSections(content).filter(
          (s) => `${s.heading}\n${s.body}`.toLowerCase().includes(needle)
        );
        if (matched.length === 0) continue;
        const rel = path.relative(process.cwd(), f);
        out += `\n\n===== ${rel} =====\n`;
        for (const s of matched) {
          out += (s.heading ? `${s.heading}\n` : "") + `${s.body.trimEnd()}\n`;
        }
      }

      if (!out.trim()) {
        return { content: [{ type: "text" as const, text: `🔍 \`${query}\` 와 일치하는 내용을 \`${SPEC_ROOT_DIR}/_codebase/\` 에서 찾지 못했습니다.` }] };
      }

      return { content: [{ type: "text" as const, text: `🔍 \`${query}\` 검색 결과\n${out.trimEnd()}` }] };
    }
  );

  return server;
}

export async function startServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
}

// 직접 실행(node mcp-server/index.js)일 때만 서버를 시작한다.
// import(테스트, cli.js)로 로드될 때는 부수효과가 없도록 한다.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startServer();
}
