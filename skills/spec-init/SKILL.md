---
name: spec-init
description: "Spec-Driven Development를 위한 프로젝트 초기화 스킬. ai-spec/projects 폴더 하위에 feature 폴더 구조를 확인·생성하고, requirement.md 템플릿과 docs/ 폴더를 셋업한다. spec 초기화, spec 생성, 새 기능 시작 요청 시 사용한다."
argument-hint: "feature 폴더명 (예: dashboard, order-management). 생략 시 AI가 요구사항을 먼저 인터뷰한다."
---

# Spec 프로젝트 초기화 스킬

## 역할

신규 기능 개발의 출발점을 구조화하는 설계자로서, feature의 범위와 목적을 명확히 정의하고 이후 스킬들이 일관되게 참조할 수 있는 spec 폴더 구조를 확립한다.

## 개요

`ai-spec/projects/<feature>/` 폴더 구조를 확인하고 생성한다.
`requirement.md` 템플릿과 필요 시 `docs/` 폴더를 셋업하는 것까지가 이 스킬의 범위이다.

docs 분석 및 requirement.md 작성, todo.md 생성은 **spec-todo 스킬**에서 담당한다.

## When to Use

- 새로운 기능 개발을 spec 기반으로 시작할 때
- `ai-spec/projects/<feature>/` 폴더와 `requirement.md` 를 처음 만들 때
- 기획서나 참고 문서를 보관할 `docs/` 폴더를 준비하고 싶을 때

---

## 사전 조건 확인

이 세션에서 `get_rules`를 아직 호출하지 않은 경우에만 호출한다. 이미 호출한 경우 생략한다.
질문 도구 선택 및 공통 규칙은 rules의 `Common — 스킬 공통 규칙` 참조.

---

## Procedure — 신규 프로젝트 초기화

### Step 1 — Feature명 확인

인자(argument)로 feature명이 전달된 경우 그대로 사용한다.
전달되지 않은 경우 다음 질문으로 인터뷰한다. (질문 도구 사용)

```
1. Feature명 (폴더명으로 사용됩니다. 영문 소문자, 하이픈 사용 권장)
   예) dashboard, order-management, product-analysis

2. 기능 요약 (한 줄로 설명)

3. 기획서나 참고 문서(PDF, 이미지 등)가 있나요? [있음 / 없음]
```

feature명은 `ai-spec/` 하위 폴더명으로 사용되므로 **영문 소문자 + 하이픈** 형식으로 정리한다.
사용자가 한글로 입력하면 적절한 영문명을 제안하고 확인받는다.

---

### Step 2 — 폴더 구조 생성

각 항목을 개별로 존재 여부를 확인하고, 없는 경우에만 생성한다.
생성됨/유지됨 목록을 구분하여 Step 7 보고에 사용한다.

| 항목 | 없는 경우 | 있는 경우 |
|------|-----------|-----------|
| `ai-spec/projects/<feature>/` 폴더 | 생성 → 생성됨 목록에 추가 | 유지됨 목록에 추가 |
| `requirement.md` | Step 6 에서 생성한다 (여기서는 생성하지 않음) | 유지됨 목록에 추가 (덮어쓰지 않음) |
| `docs/` | 기획서가 있다고 응답한 경우에만 생성 → 생성됨 목록에 추가 | 유지됨 목록에 추가 |

이후 Step 3 → Step 4 → Step 5 → Step 6 을 항상 순서대로 진행한다.
`docs/` 를 이번에 **새로 생성한 경우에만** Step 5(기획서 배치 안내)를 수행하고, 이미 존재했거나 기획서가 없으면 Step 5 를 건너뛴다.

---

### Step 3 — _codebase/ 초기화 또는 갱신

`ai-spec/_codebase/index.md` 존재 여부를 확인한다.

**_codebase/ 없는 경우 — 전체 코드베이스 분석**

1. 프로젝트 루트 디렉토리 구조를 탐색한다.
2. AI가 도메인 기준으로 논리적 모듈 경계를 판단하여 `modules/` 하위 파일 목록을 결정한다.
   (디렉토리 구조가 아닌 기능·책임 단위로 묶는다)
3. 다음 파일을 생성한다.
   - `ai-spec/_codebase/index.md` — 전체 구조 맵, tech stack, 모듈-경로 매핑 테이블
   - `ai-spec/_codebase/modules/<domain>.md` — 각 모듈별 주요 파일, 핵심 API, 패턴, 외부 의존성
   - `ai-spec/_codebase/conventions.md` — 공통 컨벤션, 네이밍 규칙, 아키텍처 패턴
   - `ai-spec/_codebase/gotchas.md` — 암묵적 제약·주의사항 (헤더와 작성 기준 안내만 담은 빈 템플릿으로 생성. 내용은 사람이 직접 작성하거나 spec-work 가 코드에서 직접 확인한 제약만 추가)
   - `ai-spec/_codebase/last-synced.md` — 분석 일시, 현재 git hash(`git rev-parse HEAD`), 트리거(`spec-init`)
4. 각 파일의 포맷은 rules의 `_codebase/ — 코드베이스 위키` 참조.

**_codebase/ 있는 경우 — 변경분만 갱신**

1. `ai-spec/_codebase/last-synced.md` 에서 마지막 git hash를 읽는다.
2. `git log <hash>..HEAD --name-only --pretty=format:` 으로 변경된 파일 목록을 확인한다.
3. 변경 파일이 없으면 → "_codebase/ 최신 상태" 로 건너뛴다.
4. 변경 파일이 있으면 → `index.md` 모듈 맵 기준으로 영향받는 모듈을 파악하고
   해당 `modules/<domain>.md` 만 재분석 후 업데이트한다.
5. `last-synced.md` 를 현재 git hash와 트리거(`spec-init`)로 갱신한다.

결과(생성됨/갱신됨/최신 상태)를 Step 6 보고에 포함한다.

---

### Step 4 — AI 어시스턴트 컨텍스트 훅 설정

`_codebase/` 신규 생성 여부와 무관하게 항상 실행한다. 각 플랫폼의 훅·지시문은 이미 설정된 경우 건너뛰는 멱등 방식으로 적용하므로, 반복 실행해도 중복 추가되지 않는다. (첫 실행 때 감지되지 않았거나 누락된 플랫폼이 이후 추가된 경우에도 다음 `spec-init` 실행에서 보강된다.)

프로젝트 루트에서 아래 각 플랫폼의 존재 여부를 확인하고, 해당하는 것에만 적용한다. 여러 개가 감지되면 모두 적용한다. 아무것도 없으면 이 단계를 건너뛴다.

---

**Claude Code** — `.claude/` 디렉토리가 존재하는 경우

`.claude/settings.json` 을 다음 절차로 병합한다.

1. 파일이 없으면 아래 JSON 전체를 새로 작성한다.
2. 파일이 있으면 기존 JSON 을 읽고 아래 두 항목을 추가한다.
   - `hooks.PreToolUse` 배열에 `matcher: "Read"` 항목이 이미 없는 경우에만 추가한다.
   - `hooks.PostToolUse` 배열에 `matcher: "Edit"`, `matcher: "Write"` 항목이 각각 없는 경우에만 추가한다.
   - 이미 동일한 `matcher` 가 존재하면 해당 항목은 건너뛴다. 기존 훅은 절대 덮어쓰지 않는다.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "cat | node -e \"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const f=(JSON.parse(s).tool_input||{}).file_path||'';const exts=['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.java','.go','.rb','.rs','.php','.cs','.kt','.swift','.cpp','.cc','.c','.h','.hpp','.scala','.vue','.svelte'];if(f&&exts.some(e=>f.endsWith(e))&&!f.includes('ai-spec'))console.log('[코드베이스] 소스 파일 탐색 전 ai-spec/_codebase/index.md 를 먼저 확인하세요 — 모듈 상세: ai-spec/_codebase/modules/')}catch(e){}})\" 2>/dev/null; exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cat | node -e \"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const f=(JSON.parse(s).tool_input||{}).file_path||'';if(f&&!f.includes('ai-spec'))console.log('[위키 동기화] 소스 파일 변경됨 → ai-spec/_codebase/ 업데이트 필요한지 확인하세요.')}catch(e){}})\" 2>/dev/null; exit 0"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "cat | node -e \"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const f=(JSON.parse(s).tool_input||{}).file_path||'';if(f&&!f.includes('ai-spec'))console.log('[위키 동기화] 새 소스 파일 생성됨 → ai-spec/_codebase/ 위키 추가 필요한지 확인하세요.')}catch(e){}})\" 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

---

**Codex** — `AGENTS.md` 또는 `.codex/` 디렉토리가 존재하는 경우

`AGENTS.md`에 아래 섹션이 없으면 추가한다. 파일이 없으면 생성한다.

```markdown
## 코드베이스 위키 활용 (spec-tools-mcp)

- 소스 파일을 직접 탐색하기 전에 `ai-spec/_codebase/index.md`를 먼저 확인하세요.
- 모듈별 상세는 `ai-spec/_codebase/modules/` 참조.
- 소스 파일 수정 후에는 `ai-spec/_codebase/` 위키 업데이트 필요 여부를 확인하세요.
```

---

**VS Code Copilot Chat** — `.github/copilot-instructions.md`가 존재하는 경우

해당 파일에 아래 섹션이 없으면 추가한다.

```markdown
## 코드베이스 위키 활용 (spec-tools-mcp)

- 소스 파일을 직접 탐색하기 전에 `ai-spec/_codebase/index.md`를 먼저 확인하세요.
- 모듈별 상세는 `ai-spec/_codebase/modules/` 참조.
- 소스 파일 수정 후에는 `ai-spec/_codebase/` 위키 업데이트 필요 여부를 확인하세요.
```

---

**Cursor** — `.cursor/` 디렉토리가 존재하는 경우

`.cursor/rules/spec-tools-mcp.mdc`를 생성한다. 이미 있으면 건너뛴다.

```markdown
---
alwaysApply: true
---

## 코드베이스 위키 활용 (spec-tools-mcp)

- 소스 파일을 직접 탐색하기 전에 `ai-spec/_codebase/index.md`를 먼저 확인하세요.
- 모듈별 상세는 `ai-spec/_codebase/modules/` 참조.
- 소스 파일 수정 후에는 `ai-spec/_codebase/` 위키 업데이트 필요 여부를 확인하세요.
```

---

각 플랫폼별 결과(추가됨/이미 설정됨/건너뜀)를 Step 7 보고에 포함한다.

---

### Step 5 — 기획서 배치 안내 (docs/ 를 이번에 새로 생성한 경우만)

`docs/` 폴더 생성 후 **질문 도구**로 아래 질문을 표시하고 사용자 응답을 기다린다.

```
질문: ai-spec/projects/<feature>/docs/ 폴더가 준비되었습니다.
      기획서(PDF, 이미지, 문서 등)를 위 폴더에 복사한 후 아래에서 선택해주세요.

선택지:
  - 파일 복사 완료       → Step 6 로 이동
  - 나중에 추가할게요    → Step 6 로 이동 (docs 분석 생략)
```

어떤 선택이든 Step 6 로 이동한다.

---

### Step 6 — requirement.md 생성

Step 2 에서 `requirement.md` 가 이미 존재(유지됨)로 확인된 경우 이 단계를 건너뛴다.
존재하지 않는 경우에만, 인터뷰에서 수집한 내용을 바탕으로 `requirement.md` 템플릿을 생성한다.
각 섹션은 `(작성 필요)` 로 채워 템플릿만 생성한다.

템플릿 선택 규칙 및 기본 템플릿은 rules의 `requirement.md 템플릿 규칙` 참조.

---

### Step 7 — 완료 보고

Step 2에서 수집한 생성됨/유지됨 목록과 Step 3의 _codebase/ 결과, Step 4의 훅 설정 결과를 함께 출력하고 다음 단계를 안내한다.

```
spec 프로젝트 초기화 결과:

✅ 생성됨:
  ai-spec/projects/<feature>/requirement.md
  ai-spec/projects/<feature>/docs/          (이번에 생성한 경우)

⏭ 유지됨 (이미 존재):
  ai-spec/projects/<feature>/  (폴더)
  ai-spec/projects/<feature>/requirement.md (이미 있던 경우)

📚 코드베이스 위키:
  ai-spec/_codebase/  (신규 생성 / 갱신됨 / 최신 상태 중 하나 표시)

🔗 Claude Code 훅:
  .claude/settings.json  (추가됨 / 이미 설정됨 / 건너뜀 중 하나 표시)

다음 단계:
requirement.md 를 직접 작성하거나, docs/ 에 기획서 또는 프로젝트와 관련된 엑셀, 이미지 등을 넣고
`spec-todo` 스킬을 사용하여 작업 목록을 자동으로 생성 합니다.
```

생성됨/유지됨 각 섹션은 해당 항목이 있는 경우에만 표시한다.

---

## 처리 규칙

- 각 파일을 개별 확인하여 누락된 파일만 생성하고, 결과를 생성됨/유지됨으로 구분하여 안내한다.
- feature명에 대문자, 공백, 특수문자가 포함된 경우 소문자+하이픈으로 변환하여 제안한다.
