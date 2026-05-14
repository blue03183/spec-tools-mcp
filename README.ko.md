**[한국어](README.ko.md)** | [中文](README.zh.md) | [English](README.md) | [日本語](README.ja.md)

# Spec-Tools-MCP

프로젝트 전반에 걸쳐 스펙 기반 AI 에이전트 스킬, 규칙, 프롬프트를 제공하는 중앙화된 MCP 서버입니다.

AI 에이전트는 대화가 길어질수록 컨텍스트를 잃는 경향이 있습니다. Spec-Tools-MCP는 모든 결정, 요구사항, 진행 상황을 채팅 기록이 아닌 마크다운 파일에 저장함으로써 이 문제를 해결합니다. 어떤 세션에서든 정확히 중단된 지점부터 재개할 수 있습니다.

## 배경

대부분의 스펙 기반 개발 MCP는 작업 파일(`plan.md`, `todo.md` 등)을 프로젝트 루트의 고정된 위치에 저장합니다. 혼자 하나의 기능을 개발할 때는 잘 작동하지만, 다음과 같은 상황에서는 금세 한계에 부딪힙니다.

- **여러 개발자**가 같은 저장소에서 서로 다른 기능을 동시에 작업하는 경우
- **여러 서브 프로젝트**가 동시에 진행 중이고 전환하거나 동료에게 인계해야 하는 경우

스펙 파일이 루트 레벨에 있으면 모든 것이 충돌합니다 — 한 개발자의 `todo.md`가 다른 개발자의 것을 덮어쓰고, 어떤 계획이 어떤 작업에 속하는지 알 수 없게 됩니다.

Spec-Tools-MCP는 바로 이런 상황을 위해 만들어졌습니다. 각 기능은 `ai-spec/projects/<feature>/` 아래 독립된 폴더를 가지므로, 여러 개발자나 서브 프로젝트가 같은 저장소에서 서로 간섭 없이 독립적으로 진행할 수 있습니다. 적절한 기능 폴더를 가리키는 것만으로 누구든지 작업을 인계받거나 재개할 수 있습니다.

## 사용법

MCP를 통해 모든 프로젝트에서 스킬을 직접 호출합니다 — 파일 복사 불필요.

#### 1. 프로젝트에 패키지 설치

```bash
npm install spec-tools-mcp --save-dev
```

#### 2. MCP 서버 설정

**옵션 A — 플러그인으로 설치 (Claude Code)**

MCP 서버와 Skills를 Claude Code 플러그인으로 한 번에 설치합니다:

```sh
/plugin marketplace add blue03183/spec-tools-mcp
/plugin install spec-tools-mcp@spec-tools-mcp-marketplace
```

Claude Code를 재시작하면 활성화됩니다. `/mcp` 또는 `/skills` 로 확인하세요.

**옵션 B — 원클릭 설치 (VS Code / GitHub Copilot)**

아래 버튼을 클릭하면 VS Code에 MCP 서버가 바로 설치됩니다:

[<img src="https://img.shields.io/badge/VS_Code-Install%20MCP%20Server-0098FF?style=flat-square&logo=visualstudiocode" alt="VS Code에 설치">](https://vscode.dev/redirect/mcp/install?name=io.github.blue03183%2Fspec-tools-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22spec-tools-mcp%22%5D%2C%22env%22%3A%7B%7D%7D)
[<img src="https://img.shields.io/badge/VS_Code_Insiders-Install%20MCP%20Server-24bfa5?style=flat-square&logo=visualstudiocode" alt="VS Code Insiders에 설치">](https://insiders.vscode.dev/redirect?url=vscode-insiders%253Amcp%252Finstall%253F%257B%2522name%2522%253A%2522io.github.blue03183%252Fspec-tools-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522spec-tools-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

또는 플러그인으로 설치 (MCP 서버 + Skills 함께 설치):

1. **Command Palette** 열기 (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. **Chat: Install Plugin From Source** 실행
3. 다음 URL 붙여넣기: `https://github.com/blue03183/spec-tools-mcp`

---

**옵션 C — 자동 설정 (권장)**

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
npx spec-tools-mcp init
```

현재 프로젝트에서 사용 중인 IDE(Claude Code, Cursor, VS Code)를 자동으로 감지하고 각각에 맞는 설정 파일을 생성합니다. 이미 설정된 항목은 건너뜁니다.

**옵션 D — npx로 실행 (수동)**

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

**옵션 E — 로컬 설치 경로 사용**

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

#### 3. VS Code 에서 설정

**Claude Code**

 프로젝트 루트 경로에 `.mcp.json` 파일을 생성하고 (npx spec-tools-mcp init 시 자동설치됨) IDE 창을 새로고침 한 후 `/mcp` (MCP servers) 명령어로 `spec-tools-mcp` 서버가 연결되었는지 확인하세요.

**GitHub Copilot**

 `.vscode/mcp.json` 파일을 생성합니다. (npx spec-tools-mcp init 시 자동설치됨)
 vscode 의 mcp 서버 실행은 터미널에서 진행되는게 아닌 `VSCode Extension Host` 에서 실행되기 떄문에 npx 및 node 명령어가 제대로 인식되지 않습니다.
 그렇기 떄문에 `.vscode/mcp.json` 파일에 `command` 와 env `PATH` 를 명시적으로 지정해 주어야 합니다.

 ```
 {
  "servers": {
    "spec-tools-mcp": {
      "type": "stdio",
      "command": "/Users/{사용자이름}/.nvm/versions/node/v24.11.0/bin/npx",    // 터미널에서 which npx 명령어로 확인한 경로를 입력해 주세요
      "args": [
        "-y",
        "spec-tools-mcp"
      ],
      "env": {
        "PATH": "/Users/{사용자이름}/.nvm/versions/node/v24.11.0/bin:/usr/local/bin:/usr/bin:/bin"  // 터미널에서 echo $PATH 명령어로 확인한 경로를 입력해 주세요
      }
    }
  }
}
 ```

위와 같이 `.vscode/mcp.json` 파일에 명시적으로 `command` 와 env `PATH` 를 지정해 주면, VS Code Extension Host에서 npx 명령어를 인식하여 MCP 서버가 정상적으로 실행됩니다.
IDE 창 새로고침 한 후 `확장` -> `MCP 서버 - 설치됨` 에서 `spec-tools-mcp` 서버에 마우스 우클릭 -> `서버 시작` 을 선택하여 서버를 수동으로 실행해 주세요.

주의! vscode 의 mcp 서버 실행 후 IDE 를 새로고침 하는경우 서버를 다시 시작해 주어야 합니다. (서버가 자동으로 재시작되지 않음)

**Codex**

CLI로 설치:

```bash
codex mcp add spec-tools-mcp -- npx -y spec-tools-mcp
```

또는 수동 설정 (`.codex/config.toml`):

```toml
[mcp_servers.spec-tools-mcp]
command = "npx"
args = ["-y", "spec-tools-mcp"]
```

프로젝트 설정이 정상적으로 적용되지않는경우 `vi ~/.codex/config.toml` 명령어로 mcp 서버 설정을 전역으로 추가해 주세요.


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
| `spec_status` | 전체 feature의 todo 진행 현황 및 승인 대기 항목 표시 | `현재 스펙 현황 알려줘` |
| `spec_handoff` | 다른 개발자나 새 세션이 바로 이어받을 수 있는 인계 문서 생성 | `dashboard 인계 문서 만들어줘` |
| `spec_archive` | 완료된 feature를 `projects/`에서 `archive/`로 이동 | `dashboard 아카이브해줘` |
| `spec_search` | `_codebase/`에서 코드 위치·심볼을 반환. `query` 지정 시 해당 섹션만 필터링 | `코드베이스에서 OrderService 검색해줘` |

**도구별 역할과 기대 효과**

**`spec_init`**  
새 기능 개발을 시작할 때 호출합니다. `ai-spec/projects/<feature>/` 아래 독립된 작업 공간을 생성해 다른 기능이나 다른 개발자 파일과의 충돌 없이 작업할 수 있게 합니다. 또한 프로젝트 공용 코드베이스 위키(`ai-spec/_codebase/`)를 생성하거나 증분 갱신합니다. 최초 실행 시 전체 코드베이스를 분석하고, 이후 실행 시에는 마지막 동기화 이후 변경된 파일만 재분석합니다.

**`spec_todo`**  
기획서나 요구사항이 준비된 후 실행합니다. `docs/` 폴더의 파일을 분석해 `requirement.md`와 자립적 태스크 목록(`todo.md`)을 생성하며, 구현 전에 AI와 사람이 요구사항을 공동 검토하는 체크포인트 역할을 합니다.

**`spec_work`**  
실제 구현을 시작하거나 이전 세션을 이어받을 때 사용합니다. `plan.md` 작성 → 사람 승인 → 코드 구현의 게이트를 강제 적용합니다. 구현 시작 시 todo 항목을 `[ ] IN PROGRESS`로 표시하고, 각 단계 완료마다 `update.md`에 기록합니다. 세션이 중단되어도 `IN PROGRESS` 상태와 `update.md`를 보고 정확히 중단된 지점부터 재개할 수 있습니다. 코드 위치는 워크스페이스를 재탐색하는 대신 `_codebase/`를 참조하며, 구현 중 새로 발견한 정보는 즉시 `_codebase/`에 반영합니다.

**`get_rules`**  
AI가 개발 프로토콜을 모르거나 작업 방식을 재확인해야 할 때 호출합니다. `spec-development-rules.md` 전체를 반환해 AI가 올바른 스펙 기반 방식을 따르도록 보장합니다.

**`spec_status`**  
여러 기능이 동시에 진행 중일 때 전체 현황을 파악하고 싶을 때 사용합니다. 모든 feature의 todo 완료율과 `[대기]` 상태 plan을 한눈에 보여줘 승인 대기 항목을 놓치지 않도록 합니다.

**`spec_handoff`**  
팀원에게 작업을 인계하거나 장기간 해당 기능을 중단해야 할 때 사용합니다. 기능 목표·todo 현황·핵심 코드 위치를 하나의 문서로 정리해 새 세션이나 다른 개발자가 코드베이스 재탐색 없이 바로 이어받을 수 있게 합니다.

**`spec_archive`**  
기능 개발이 완전히 완료된 후 호출합니다. feature 폴더를 `ai-spec/archive/`로 이동시켜 `projects/`를 활성 작업만 남긴 상태로 유지합니다. 미완료 todo가 있으면 차단됩니다.

**`spec_search`**  
`_codebase/`를 직접 열지 않고도 파일 위치나 심볼을 빠르게 조회할 때 사용합니다. `query` 키워드를 지정하면 해당 내용이 포함된 섹션만 반환합니다. 특정 클래스나 함수가 마지막으로 기록된 위치를 찾을 때 유용합니다.

#### 8. 워크플로우

1. `spec_init`으로 프로젝트 **초기화**
   - `ai-spec/projects/{project-name}/` 폴더 생성, `requirement.md` 템플릿 및 선택적 `docs/` 폴더 생성
   - 공용 코드베이스 위키(`ai-spec/_codebase/`) 생성 또는 갱신 (최초 실행 시 전체 분석, 이후 git 변경분만 증분 갱신)

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
   - 승인 게이트는 MCP 서버 레벨에서 강제 적용: `plan.md`가 아직 `[대기]` 상태이면 구현이 차단됨
   - 구현 시작 시 가장 먼저 todo 항목 상태를 `[ ] IN PROGRESS`로 표시 — 토큰 한도 등으로 세션이 중단되어도 어떤 작업이 진행 중이었는지 추적 가능
   - 각 단계 완료 시 `update.md`에 진행 상황 기록

5. 새 세션에서 `spec_work`를 호출하면 **언제든 재개** 가능
   - AI가 todo.md에서 `IN PROGRESS` 항목을 먼저 찾아 해당 작업으로 이동하고, `update.md`가 있으면 미완료 항목부터 이어서 진행
   - `_codebase/`가 누적된 코드 위치·패턴 지식을 제공하여 매 세션·기능마다 처음부터 코드베이스를 재탐색하지 않아도 됨

6. 이후 작업은 3~4단계 반복

7. **작업 인계** 시 인계 문서 요청
   - `spec_handoff`가 기능 목표, todo 현황, 진행 상태, 핵심 코드 위치를 하나의 문서로 생성

8. **기능 완료** 후 아카이브하여 `projects/` 정리
   - `spec_archive`가 폴더를 `ai-spec/archive/`로 이동 — 미완료 todo가 있으면 차단

#### 9. 생성 폴더 구조

```
ai-spec
├─ _codebase/                      # 프로젝트 공용 코드베이스 위키 (전체 기능 공유)
│   ├─ index.md                    # 전체 디렉토리 맵, tech stack, 모듈-경로 매핑 테이블
│   ├─ last-synced.md              # 마지막 분석 시점 (git hash + 트리거)
│   ├─ modules/
│   │   └─ <domain>.md             # 도메인별: 주요 파일, 핵심 API, 패턴, 의존성
│   └─ conventions.md              # 공통 컨벤션, 네이밍 규칙, 아키텍처 패턴
├─ templates/                      # (선택) 커스텀 템플릿
│   ├─ requirement.md              # 커스텀 요구사항 템플릿
│   └─ todo.md                     # 커스텀 todo 템플릿
└─ projects/
    └─ <feature>                   # 기능별 프로젝트 폴더
        ├─ requirement.md          # 요구사항 문서 (Single Source of Truth)
        ├─ design.md               # 아키텍처 설계 문서 (복잡한 기능에서 생성)
        ├─ todo.md                 # AI가 생성한 작업 목록
        ├─ docs/                   # 원본 기획 파일 (PDF, 이미지 등)
        └─ <T-번호>-<요약>/        # 작업별 폴더
            ├─ plan.md             # 설계 의도, 구현 방법, 승인 상태
            └─ update.md           # 구현 진행 기록 + 검수 체크리스트
```

**`_codebase/` 역할**: AI가 발견한 파일 위치, 스키마, 패턴을 모든 기능에 걸쳐 공유하는 위키입니다. 기능별 캐시와 달리 시간이 지날수록 지식이 누적됩니다. 새 기능과 완료된 작업이 쌓일수록 불필요한 재탐색이 줄어듭니다.

**커스텀 템플릿**: `ai-spec/templates/requirement.md` 또는 `ai-spec/templates/todo.md`를 추가하면 기본 내장 형식 대신 직접 정의한 템플릿을 사용할 수 있습니다.

#### 10. 참고 사항

- `ai-spec/_codebase/`는 지속적인 코드베이스 지식 베이스 역할을 합니다. `spec_init`으로 한 번 구축해두면, 이후 모든 기능과 작업에서 워크스페이스 재탐색 없이 참조할 수 있어 프로젝트가 성장할수록 토큰 절약 효과가 커집니다.
- 컨텍스트가 너무 길어지면 AI 정확도가 저하될 수 있습니다. 각 TODO 항목마다 새 세션을 시작하는 것을 권장합니다. 작업 번호를 직접 전달하면 (예: `spec_work T-02`) 해당 항목으로 바로 이동합니다.

---

## 기여하기

기여는 언제나 환영합니다! 버그를 발견하거나 기능 요청이 있으시면 [이슈를 등록](https://github.com/blue03183/spec-tools-mcp/issues)해주세요. Pull Request도 적극 환영합니다.

## 라이선스

MIT
