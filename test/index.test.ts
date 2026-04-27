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

  it("4개 도구가 등록되어 있다", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(4);
    const names = tools.map((t) => t.name);
    expect(names).toContain("spec_init");
    expect(names).toContain("spec_todo");
    expect(names).toContain("spec_work");
    expect(names).toContain("get_rules");
  });

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

  it("spec_work 도구가 SKILL.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "spec_work", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  });

  it("get_rules가 spec-development-rules.md 내용을 반환한다", async () => {
    const result = await client.callTool({ name: "get_rules", arguments: {} });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain("Spec-Driven Development");
  });
});
