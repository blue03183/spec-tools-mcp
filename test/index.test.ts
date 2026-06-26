import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { createServer } from "../mcp-server/index.js";

describe("MCP 서버 로드 확인", () => {
  let client: Client;

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await createServer().connect(serverTransport);
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  it("8개 도구가 등록되어 있다", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(8);
    const names = tools.map((t) => t.name);
    expect(names).toContain("spec_init");
    expect(names).toContain("spec_todo");
    expect(names).toContain("spec_work");
    expect(names).toContain("get_rules");
    expect(names).toContain("spec_status");
    expect(names).toContain("spec_handoff");
    expect(names).toContain("spec_archive");
    expect(names).toContain("spec_search");
  });

  // ── 기존 도구 ──────────────────────────────────────────────────────────────

  it("spec_init 도구가 SKILL.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "spec_init", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  });

  it("spec_todo 도구가 SKILL.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "spec_todo", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  });

  it("spec_work 인자 없이 호출하면 SKILL.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "spec_work", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  });

  it("get_rules가 spec-development-rules.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "get_rules", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("Spec-Driven Development");
  });

  // ── 신규 도구 ──────────────────────────────────────────────────────────────

  it("spec_status — projects 폴더가 없으면 오류 메시지를 반환한다", async () => {
    const result = await client.callTool({ name: "spec_status", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    // 테스트 환경에는 ai-spec/projects/ 가 없으므로 오류 메시지 반환
    expect(text.length).toBeGreaterThan(0);
  });

  it("spec_handoff — 존재하지 않는 feature 는 오류 메시지를 반환한다", async () => {
    const result = await client.callTool({ name: "spec_handoff", arguments: { feature: "__nonexistent__" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("찾을 수 없습니다");
  });

  it("spec_archive — 존재하지 않는 feature 는 오류 메시지를 반환한다", async () => {
    const result = await client.callTool({ name: "spec_archive", arguments: { feature: "__nonexistent__" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("찾을 수 없습니다");
  });

  it("spec_work — feature+todo 제공 시 plan.md 없으면 SKILL.md 내용을 반환한다", async () => {
    const result = await client.callTool({
      name: "spec_work",
      arguments: { feature: "__nonexistent__", todo: "T-01" },
    });
    const text = (result.content[0] as { text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  });

  // ── spec_search ──────────────────────────────────────────────────────────────

  it("spec_search — query 없이 호출하면 index.md 본문과 목차를 반환한다", async () => {
    const result = await client.callTool({ name: "spec_search", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("코드베이스");
    expect(text).toContain("목차");
  });

  it("spec_search — query 매칭 시 해당 섹션을 반환한다", async () => {
    const result = await client.callTool({
      name: "spec_search",
      arguments: { query: "프로젝트" },
    });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("프로젝트");
  });

  it("spec_search — 매칭이 없으면 안내 메시지를 반환한다", async () => {
    const result = await client.callTool({
      name: "spec_search",
      arguments: { query: "ZZ_NO_MATCH_ZZ" },
    });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("찾지 못했습니다");
  });
});

// spec_work 승인 게이트 — 임시 워크스페이스에서 plan.md 상태별 동작을 검증한다.
describe("spec_work 승인 게이트", () => {
  let client: Client;
  let tmpDir: string;
  let cwd: string;

  async function writeFeature(feature: string, todoBody: string, planStatus: string | null) {
    const featDir = path.join(tmpDir, "ai-spec", "projects", feature);
    await fs.ensureDir(featDir);
    await fs.writeFile(path.join(featDir, "requirement.md"), "# req\n## 기능 목표\n목표\n");
    await fs.writeFile(path.join(featDir, "todo.md"), todoBody);
    const taskDir = path.join(featDir, "T-01-demo");
    await fs.ensureDir(taskDir);
    const plan =
      planStatus === null
        ? "# [T-01] demo\n## 설계 목표\n목표\n"
        : `# [T-01] demo\n## 설계 목표\n목표\n\n## Approval Status\n${planStatus}\n\n## User Feedback\n(없음)\n`;
    await fs.writeFile(path.join(taskDir, "plan.md"), plan);
  }

  beforeAll(async () => {
    cwd = process.cwd();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "spec-gate-"));
    process.chdir(tmpDir);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await createServer().connect(serverTransport);
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    process.chdir(cwd);
    await fs.remove(tmpDir);
  });

  const todoTodo = "## [T-01] demo\n- 상태: [ ] TODO\n- 작업내용: x\n";

  it("[대기] 상태면 구현을 차단한다", async () => {
    await writeFeature("waiting", todoTodo, "[대기]");
    const result = await client.callTool({ name: "spec_work", arguments: { feature: "waiting", todo: "T-01" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("구현 차단");
  });

  it("[승인] 상태면 구현 절차(SKILL)를 제공한다", async () => {
    await writeFeature("approved", todoTodo, "[승인]");
    const result = await client.callTool({ name: "spec_work", arguments: { feature: "approved", todo: "T-01" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("승인 확인");
    expect(text).not.toContain("구현 차단");
  });

  it("Approval Status 라인이 없으면 안전하게 차단한다 (unknown)", async () => {
    await writeFeature("garbled", todoTodo, null);
    const result = await client.callTool({ name: "spec_work", arguments: { feature: "garbled", todo: "T-01" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("구현 차단");
  });

  it("[승인] 에 주석이 붙어도 승인으로 인식한다", async () => {
    await writeFeature("annotated", todoTodo, "[승인] (2026-06-26 검토 완료)");
    const result = await client.callTool({ name: "spec_work", arguments: { feature: "annotated", todo: "T-01" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("승인 확인");
  });

  it("todo 인자 없이 호출해도 활성 항목의 [대기] plan 을 차단한다", async () => {
    await writeFeature("noarg", todoTodo, "[대기]");
    const result = await client.callTool({ name: "spec_work", arguments: { feature: "noarg" } });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("구현 차단");
  });

  it("skill_loaded=true 면 승인 경로에서 스킬 본문을 생략한다", async () => {
    await writeFeature("loaded", todoTodo, "[승인]");
    const full = await client.callTool({ name: "spec_work", arguments: { feature: "loaded", todo: "T-01" } });
    const slim = await client.callTool({ name: "spec_work", arguments: { feature: "loaded", todo: "T-01", skill_loaded: true } });
    const fullText = (full.content[0] as { text: string }).text;
    const slimText = (slim.content[0] as { text: string }).text;
    expect(slimText).toContain("승인 확인");
    expect(slimText).toContain("본문을 생략");
    expect(slimText.length).toBeLessThan(fullText.length);
  });
});
