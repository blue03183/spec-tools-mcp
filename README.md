# Spec-Tools-MCP

AI 에이전트용 Skills · 규칙 · 프롬프트를 MCP로 제공하는 중앙 저장소입니다.

## 사용 방법

MCP를 통해 다른 프로젝트에서 직접 스킬을 호출합니다.

#### 1. 대상 프로젝트에 패키지 추가

```bash
pnpm add -D git+https://github.com/blue03183/spec-tools-mcp.git
```

#### 2. `.vscode/mcp.json` 설정

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

#### 3. 제공 도구

| 도구 | 설명 | 사용 예 |
|------|------|---------|
| `spec_init` | 새 feature spec 프로젝트 초기화 | `#spec_init seller-dashboard` |
| `spec_todo` | 기획서 분석 후 requirement.md · todo.md 생성 | `#spec_todo seller-dashboard` |
| `spec_work` | todo 항목 plan 작성 → 승인 → 구현 | `#spec_work seller-dashboard T-01` |
| `get_rules` | spec-development-rules.md 내용 반환 | `#get_rules` |

#### 4. 작업 흐름

1. `spec_init` 으로 프로젝트 초기화
 - 프로젝트 root 에 `ai-spec` 폴더 생성 및 초기 파일 세팅
2. 요구사항 분석에 필요한 기획문서등의 자료가 있는경우 `ai-spec/projects/{project-name}/docs` 폴더에 업로드
 - 업로드한 자료는 `spec_todo` 도구로 분석하여 요구사항과 작업 항목을 도출하는데 활용
 - 미리 작성할 요구사항이 있다면 `ai-spec/projects/{project-name}/requirement.md` 파일에 작성
3. `spec_todo` 로 docs 분석 후 requirement.md · todo.md 생성
 - requirement.md 가 이미 작성되어있는경우 분석된 파일내용을 요구사항 하위에 추가.
4. `spec_work` 으로 todo 항목별 작업 계획 작성 → 승인 → 구현
 - 작업 계획은 `ai-spec/projects/{project-name}/plans/{task-id}/plan.md` 파일에 작성
 - 사용자가 plan 을 확인후 승인하면 구현 단계로 넘어감
 - 구현중 프로젝트에 대해 분석된 내용은 `ai-spec/projects/{project-name}/plans/{task-id}/search.md` 에 작성되고 동일 프로젝트 내에서 해당 내용을 참고하며 작업 진행.
 - 구현이 완료된 작업 계획은 `ai-spec/projects/{project-name}/{task-id}/update.md` 에 업데이트
5. 다음 작업이 있는 경우 3 ~ 4 반복
