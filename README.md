# Spec-Driven MCP

AI 에이전트용 Skills · 규칙 · 프롬프트를 MCP로 제공하는 중앙 저장소입니다.

## 사용 방법

MCP를 통해 다른 프로젝트에서 직접 스킬을 호출합니다.

#### 1. 대상 프로젝트에 패키지 추가

```bash
pnpm add -D git+https://github.com/blue03183/spec-driven-mcp.git
```

#### 2. `.vscode/mcp.json` 설정

```json
{
  "servers": {
    "spec-driven-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["./node_modules/spec-driven-mcp/mcp-server/index.js"]
    }
  }
}
```

#### 3. 제공 도구

| 도구 | 설명 | 사용 예 |
|------|------|---------|
| `spec_init` | 새 feature spec 프로젝트 초기화 | `#spec_init seller-dashboard` |
| `spec_todo` | 기획서 분석 후 requirement.md · todo.md 생성 | `#spec_todo seller-dashboard` |
| `spec_work` | todo 항목 plan 작성 → 승인 → 구현 | `#spec_work seller-dashboard T-01` |
| `get_rules` | spec-development-rules.md 내용 반환 | `#get_rules` |

