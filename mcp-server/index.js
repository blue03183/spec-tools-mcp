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
const SPEC_ROOT_DIR = process.env.SPEC_ROOT_DIR ?? "ai-spec";
async function readSkill(skillName) {
    const skillPath = path.join(SKILLS_DIR, skillName, "SKILL.md");
    const content = await fs.readFile(skillPath, "utf-8");
    const prefix = `> **[SPEC_ROOT_DIR]** 스펙 파일 루트 경로: \`${SPEC_ROOT_DIR}\`\n> SKILL.md 내 \`ai-spec/\` 경로가 나오면 이 값으로 대체하여 사용하세요.\n\n`;
    return { content: [{ type: "text", text: prefix + content }] };
}
export function createServer() {
    const server = new McpServer({
        name: "spec-tools-mcp",
        version: "1.0.0",
    });
    server.tool("spec_init", "Spec-Driven Development를 위한 프로젝트 초기화. ai-spec/projects/<feature> 폴더 구조와 requirement.md 를 생성한다.", {
        feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 인터뷰한다."),
    }, async () => readSkill("spec-init"));
    server.tool("spec_todo", "docs/ 기획서를 분석하여 requirement.md 를 작성·보완하고 todo.md 를 생성한다.", {
        feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 목록을 확인한다."),
    }, async () => readSkill("spec-todo"));
    server.tool("spec_work", "todo.md 항목을 plan.md 작성 → 승인 → 구현 → 완료 보고 순으로 실행한다.", {
        feature: z.string().optional().describe("feature 폴더명 (예: dashboard). 생략 시 AI가 목록을 확인한다."),
        todo: z.string().optional().describe("진행할 todo 번호 (예: T-01). 생략 시 첫 번째 미완료 항목을 선택한다."),
    }, async () => readSkill("spec-work"));
    server.tool("get_rules", "spec-development-rules.md 내용을 반환합니다.", {}, async () => {
        const rulesPath = path.join(RULES_DIR, "spec-development-rules.md");
        const content = await fs.readFile(rulesPath, "utf-8");
        const prefix = `> **[SPEC_ROOT_DIR]** 스펙 파일 루트 경로: \`${SPEC_ROOT_DIR}\`\n> 규칙 내 \`ai-spec/\` 경로가 나오면 이 값으로 대체하여 사용하세요.\n\n`;
        return { content: [{ type: "text", text: prefix + content }] };
    });
    return server;
}
const transport = new StdioServerTransport();
await createServer().connect(transport);
//# sourceMappingURL=index.js.map