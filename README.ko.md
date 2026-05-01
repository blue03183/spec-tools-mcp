**[한국어](README.ko.md)** | [中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md)

# Spec-Tools-MCP

프로젝트 전반에 걸쳐 스펙 기반 AI 에이전트 스킬, 규칙, 프롬프트를 제공하는 중앙화된 MCP 서버입니다.

AI 에이전트는 대화가 길어질수록 컨텍스트를 잃는 경향이 있습니다. Spec-Tools-MCP는 모든 결정, 요구사항, 진행 상황을 채팅 기록이 아닌 마크다운 파일에 저장함으로써 이 문제를 해결합니다. 어떤 세션에서든 정확히 중단된 지점부터 재개할 수 있습니다.

## 배경

대부분의 스펙 기반 개발 MCP는 작업 파일(`plan.md`, `search.md`, `todo.md` 등)을 프로젝트 루트의 고정된 위치에 저장합니다. 혼자 하나의 기능을 개발할 때는 잘 작동하지만, 다음과 같은 상황에서는 금세 한계에 부딪힙니다.

- **여러 개발자**가 같은 저장소에서 서로 다른 기능을 동시에 작업하는 경우
- **여러 서브 프로젝트**가 동시에 진행 중이고 전환하거나 동료에게 인계해야 하는 경우

스펙 파일이 루트 레벨에 있으면 모든 것이 충돌합니다 — 한 개발자의 `todo.md`가 다른 개발자의 것을 덮어쓰고, `search.md`는 관련 없는 기능의 탐색 결과가 뒤섞이며, 어떤 계획이 어떤 작업에 속하는지 알 수 없게 됩니다.

Spec-Tools-MCP는 바로 이런 상황을 위해 만들어졌습니다. 각 기능은 `ai-spec/projects/<feature>/` 아래 독립된 폴더를 가지므로, 여러 개발자나 서브 프로젝트가 같은 저장소에서 서로 간섭 없이 독립적으로 진행할 수 있습니다. 적절한 기능 폴더를 가리키는 것만으로 누구든지 작업을 인계받거나 재개할 수 있습니다.

## 사용법

MCP를 통해 모든 프로젝트에서 스킬을 직접 호출합니다 — 파일 복사 불필요.

#### 1. 프로젝트에 패키지 설치

```bash
npm install spec-tools-mcp
```

#### 2. MCP 서버 설정

**옵션 A — npx로 실행 (로컬 설치 불필요)**

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

**옵션 B — 로컬 설치 경로 사용**

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

#### 3. IDE 설정

**VS Code + GitHub Copilot** (`.vscode/mcp.json`) — 위 옵션 A 또는 B 사용

**Claude Code** (`.mcp.json`):

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

**Claude Desktop** (`claude_desktop_config.json`):

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

**Codex** (`.codex/config.toml`):

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp"]
```

**Cursor** (`.cursor/mcp.json`):

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

**JetBrains** (MCP 플러그인):

플러그인 설정 UI에 다음 명령어를 입력하세요:

```
npx -y spec-tools-mcp
```

#### 4. 커스텀 스펙 디렉토리 (선택)

기본적으로 스펙 파일은 프로젝트 루트의 `ai-spec/` 아래에 저장됩니다. 다른 경로를 사용하려면 `SPEC_ROOT_DIR` 환경 변수를 설정하세요:

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

#### 5. 재시작 및 확인

MCP 설정을 추가한 후 **AI 에이전트를 재시작**하세요 (IDE 창 새로고침 또는 채팅 세션 재시작).

**연결 확인**은 AI에게 다음과 같이 질문하세요:

```
사용 가능한 MCP 도구가 뭐야?
```

또는 `get_rules`를 직접 호출하세요:

```
get_rules
```

서버가 연결되면 AI가 네 가지 도구(`spec_init`, `spec_todo`, `spec_work`, `get_rules`)를 나열하거나 개발 규칙 문서를 반환합니다.

#### 6. 스킬 사용법

MCP 서버가 연결되면 AI 채팅에서 자연어로 스킬을 요청하세요.

**VS Code (GitHub Copilot — 에이전트 모드)**

Copilot Chat을 에이전트 모드로 전환한 후 자연스럽게 요청하거나, `#` 명령으로 스킬을 직접 호출하세요:

```
#spec_init dashboard
#spec_todo dashboard
#spec_work T-01
```

**Claude Code (CLI)**

Claude Code 채팅에서 직접 요청하세요:

```
spec_init으로 dashboard 초기화해줘
spec_todo로 요구사항 분석해줘
spec_work로 T-01 진행해줘
```

#### 7. 사용 가능한 도구

| 도구 | 설명 | 예시 |
|------|------|------|
| `spec_init` | 새 기능 스펙 프로젝트 초기화 | `spec_init으로 dashboard 초기화해줘` |
| `spec_todo` | 기획서 분석 후 requirement.md · todo.md 생성 | `spec_todo로 요구사항 분석해줘` |
| `spec_work` | todo 항목 계획 수립 → 승인 → 구현 | `spec_work로 T-01 진행해줘` |
| `get_rules` | spec-development-rules.md 내용 반환 | `개발 규칙 보여줘` |

#### 8. 워크플로우

1. `spec_init`으로 프로젝트 **초기화**
   - `ai-spec/projects/{project-name}/` 폴더 생성, `requirement.md` 템플릿 및 선택적 `docs/` 폴더 생성

2. **기획서 업로드** (선택)
   - PDF, 이미지 등 기획 파일을 `ai-spec/projects/{project-name}/docs/`에 복사

3. **`spec_todo` 실행** — 기획서 분석 및 스펙 파일 생성
   - docs를 읽고 `requirement.md` 작성 — AI가 계속 진행 전 검토 요청
   - 복잡한 기능(신규 API, DB 스키마 변경, 컴포넌트 아키텍처)의 경우 `design.md` 초안 작성 후 검토 요청
   - 자립적 작업 항목이 담긴 `todo.md` 생성 (T-01, T-02, …)
   - `requirement.md`가 이미 있으면 분석 내용을 기존 요구사항 아래에 추가

4. **`spec_work` 실행** — 각 작업 구현
   - AI가 선택된 작업의 `plan.md`를 작성하고 승인 요청
   - 계획 파일을 직접 검토 — 채팅으로 변경 사항을 설명할 필요 없이 `plan.md`를 직접 수정하고 `수정 완료` 입력
   - `승인` 또는 `진행해`를 입력하면 구현 시작
   - 각 단계 완료 시 `update.md`에 진행 상황 기록

5. 새 세션에서 `spec_work`를 호출하면 **언제든 재개** 가능
   - AI가 `update.md`를 읽어 중단된 위치를 파악하고 이어서 진행
   - `search.md`가 발견된 코드 위치를 캐시하여 매 세션마다 코드베이스를 재탐색하지 않아도 됨

6. 이후 작업은 3~4단계 반복

#### 9. 생성 폴더 구조

```
ai-spec
├─ templates/                      # (선택) 커스텀 템플릿
│   ├─ requirement.md              # 커스텀 요구사항 템플릿
│   └─ todo.md                     # 커스텀 todo 템플릿
└─ projects/
    └─ <feature>                   # 기능별 프로젝트 폴더
        ├─ requirement.md          # 요구사항 문서 (Single Source of Truth)
        ├─ design.md               # 아키텍처 설계 문서 (복잡한 기능에서 생성)
        ├─ search.md               # AI가 발견한 코드 위치·스키마 누적 기록
        ├─ todo.md                 # AI가 생성한 작업 목록
        ├─ docs/                   # 원본 기획 파일 (PDF, 이미지 등)
        └─ <T-번호>-<요약>/        # 작업별 폴더
            ├─ plan.md             # 설계 의도, 구현 방법, 승인 상태
            └─ update.md           # 구현 진행 기록 + 검수 체크리스트
```

**`search.md` 역할**: AI가 발견한 파일 위치, 스키마, 패턴을 여기에 기록하여 매 세션마다 처음부터 코드베이스를 재탐색하지 않아도 됩니다. 프로젝트가 진행될수록 불필요한 탐색이 줄어듭니다.

**커스텀 템플릿**: `ai-spec/templates/requirement.md` 또는 `ai-spec/templates/todo.md`를 추가하면 기본 내장 형식 대신 직접 정의한 템플릿을 사용할 수 있습니다.

#### 10. 참고 사항

- 프로젝트에 `CLAUDE.md` 또는 `copilot-instructions.md`가 있고 폴더 구조, 주요 파일 경로, 기술 스택이 기술되어 있으면, AI가 광범위한 코드베이스 탐색을 건너뛰고 관련 파일에 바로 집중할 수 있습니다.
- 컨텍스트가 너무 길어지면 AI 정확도가 저하될 수 있습니다. 각 TODO 항목마다 새 세션을 시작하는 것을 권장합니다. 작업 번호를 직접 전달하면 (예: `spec_work T-02`) 해당 항목으로 바로 이동합니다.

---

## 기여하기

기여는 언제나 환영합니다! 버그를 발견하거나 기능 요청이 있으시면 [이슈를 등록](https://github.com/blue03183/spec-tools-mcp/issues)해주세요. Pull Request도 적극 환영합니다.

## 라이선스

MIT
