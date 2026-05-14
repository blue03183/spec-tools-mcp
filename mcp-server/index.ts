#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(KIT_ROOT, "skills");
const RULES_DIR = path.join(KIT_ROOT, "rules");
const SPEC_ROOT_DIR: string = process.env.SPEC_ROOT_DIR ?? "ai-spec";

const fileCache = new Map<string, string>();

async function cachedRead(filePath: string): Promise<string> {
  const cached = fileCache.get(filePath);
  if (cached !== undefined) return cached;
  const content: string = await fs.readFile(filePath, "utf-8");
  fileCache.set(filePath, content);
  return content;
}

function buildPrefix(label: string): string {
  return `> **[SPEC_ROOT_DIR]** 스펙 파일 루트 경로: \`${SPEC_ROOT_DIR}\`\n> ${label} 내 \`ai-spec/\` 경로가 나오면 이 값으로 대체하여 사용하세요.\n\n`;
}

async function readSkillText(skillName: string): Promise<string> {
  const skillPath = path.join(SKILLS_DIR, skillName, "SKILL.md");
  const content = await cachedRead(skillPath);
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
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      if (lines[j].startsWith("##")) break;
      if (/상태:.*\[x\]/.test(lines[j])) { done = true; break; }
    }
    items.push({ id, title, done });
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

// ── 서버 ──────────────────────────────────────────────────────────────────────

export function createServer() {
  const server = new McpServer({
    name: "spec-tools-mcp",
    version: "1.0.0",
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
          const planPath = await findPlanMd(featDir, todoId);

          if (planPath) {
            const status = await readApprovalStatus(planPath);
            const rel = path.relative(process.cwd(), planPath);

            if (status === "[대기]") {
              prefix += `> ⚠️ **승인 게이트**: \`${todoId}\` plan.md 가 **[대기]** 상태입니다.\n> plan.md 를 검토 후 Approval Status 를 \`[승인]\` 으로 변경하거나, 채팅에 "승인" 을 입력하세요.\n> 경로: \`${rel}\`\n\n`;
              return { content: [{ type: "text" as const, text: prefix + skillText }] };
            }
            if (status === "[수정]") {
              prefix += `> 🔄 **수정 요청 상태**: \`${todoId}\` plan.md 에 수정 요청이 있습니다.\n> User Feedback 을 반영하여 plan.md 를 업데이트한 후 "수정 완료" 를 입력하세요.\n> 경로: \`${rel}\`\n\n`;
              return { content: [{ type: "text" as const, text: prefix + skillText }] };
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
      const content = await cachedRead(rulesPath);
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
          const pending = todos.filter((t) => !t.done);

          report += `- 진행률: ${done.length}/${todos.length} 완료\n`;
          if (pending.length > 0) {
            report += `- 미완료: ${pending.map((t) => t.id).join(", ")}\n`;
          }

          // 모든 todo 완료 시 한 줄 요약만 표시 (plan.md 순회 생략)
          if (pending.length === 0) {
            report += `- ✅ 모든 작업 완료 (${todos.length}개)\n`;
          } else {
            const pendingApprovals: string[] = [];
            for (const todo of pending) {
              const planPath = await findPlanMd(featDir, todo.id);
              if (planPath) {
                const status = await readApprovalStatus(planPath);
                if (status === "[대기]" || status === "[수정]") {
                  pendingApprovals.push(`${todo.id}(${status})`);
                }
              }
            }
            if (pendingApprovals.length > 0) {
              report += `- 승인 대기: ${pendingApprovals.join(", ")}\n`;
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
      await fs.move(featDir, archiveDest, { overwrite: false });

      return {
        content: [{
          type: "text" as const,
          text: `✅ \`${feature}\` 아카이브 완료\n\n이동: \`${SPEC_ROOT_DIR}/projects/${feature}/\` → \`${SPEC_ROOT_DIR}/archive/${feature}/\``,
        }],
      };
    }
  );

  return server;
}

const transport = new StdioServerTransport();
await createServer().connect(transport);
