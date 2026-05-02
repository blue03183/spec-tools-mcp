import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../mcp-server/index.js";

describe("MCP 서버 로드 확인", () => {
  let client: Client;

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await createServer().connect(serverTransport);
    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  it("7개 도구가 등록되어 있다", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(7);
    const names = tools.map((t) => t.name);
    expect(names).toContain("spec_init");
    expect(names).toContain("spec_todo");
    expect(names).toContain("spec_work");
    expect(names).toContain("get_rules");
    expect(names).toContain("spec_status");
    expect(names).toContain("spec_handoff");
    expect(names).toContain("spec_archive");
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
});
