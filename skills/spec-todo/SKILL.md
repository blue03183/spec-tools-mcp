---
name: spec-todo
description: "Spec-Driven Development의 요구사항 분석 및 todo 생성 스킬. docs/ 폴더의 기획서를 분석하여 requirement.md 를 작성·수정하고, 워크스페이스 탐색 후 todo.md 를 생성한다. docs 분석, requirement 작성, 기획서 분석, todo 작성, todo 생성 요청 시 사용한다."
argument-hint: "feature 폴더명 (예: insights, dashboard). 생략 시 AI가 feature 목록을 확인하여 선택을 요청한다."
---

# Spec Todo 스킬

## 역할

요구사항 분석 전문가로서 기획서와 문서를 구조적으로 해석하고, 사용자의 의도·제약·승인 기준을 빠짐없이 requirement.md에 담아낸다. 모호한 요구사항은 명확히 하고, 복잡한 기능은 구현 가능한 단위 작업으로 분해한다.

## 개요

`ai-spec/projects/<feature>/` 의 docs 를 분석하여 `requirement.md` 를 작성·보완하고,
워크스페이스 탐색 결과를 바탕으로 `todo.md` 를 생성하는 스킬이다.

spec-development-rules.md 의 Step 2 ~ Step 4 를 커버한다.

## When to Use

**A. requirement.md 작성/수정**
- docs/ 폴더에 기획서가 있으면 분석하여 requirement.md 를 작성·보완한다
- docs/ 폴더에 파일이 없으면 기존 requirement.md 를 그대로 사용하거나 템플릿 상태에서 시작한다
- 기획서가 업데이트되어 requirement.md 를 재검토하고 싶을 때

**B. todo.md 생성**
- requirement.md 작성이 완료된 후 구현 작업 목록을 생성하고 싶을 때
- 요구사항을 바탕으로 어떤 작업이 필요한지 분석하고 싶을 때

트리거 문장 예시
```
docs 분석해서 requirement 작성해줘
기획서 보고 요구사항 뽑아줘
docs 업데이트됐어
todo 작성해줘
todo 생성해줘
requirement 작성해줘
```

---

## 사전 조건 확인

이 세션에서 `get_rules`를 아직 호출하지 않은 경우에만 호출한다. 이미 호출한 경우 생략한다.
질문 도구 선택 및 공통 규칙은 rules의 `Common — 스킬 공통 규칙` 참조.

---

## Procedure A — docs 분석 후 requirement.md 작성

### A-1 — feature 폴더 확인

인자로 feature명이 전달된 경우 그대로 사용한다.
전달되지 않은 경우 `ai-spec/projects/` 하위 폴더 목록을 확인하고
하나라면 자동 선택, 여러 개라면 **질문 도구**로 선택을 요청한다.

```
질문: 어떤 feature 를 진행할까요?

선택지: [폴더 목록 동적 생성]
  - dashboard
  - order-management
  - ...
  [직접 입력 허용]
```

`ai-spec/projects/<feature>/docs/` 폴더의 파일 목록을 확인한다.

| docs/ 상태 | 처리 |
|------------|------|
| 파일 있음 | A-2 로 이동 (문서 분석) |
| 파일 없음 또는 폴더 없음 | 문서 분석 생략, A-3 으로 바로 이동 (기존 requirement.md 기반으로 작업) |

---

### A-2 — 문서 분석 (docs/ 파일이 있는 경우만)

`docs/` 폴더의 각 파일을 분석한다.

| 파일 유형 | 처리 방법 |
|----------|-----------|
| 이미지 (.png, .jpg, .gif, .webp 등) | view_image 도구로 내용 분석 |
| PDF | 텍스트 추출 가능한 경우 읽기, 불가능한 경우 사용자에게 내용 요약 요청 |
| 마크다운 / 텍스트 | read_file 도구로 직접 읽기 |

분석 시 다음 항목을 추출한다.

- 기능 목표 및 배경
- 화면 구성 및 UI 흐름
- 주요 기능 목록
- 예외 케이스 및 제약 조건
- 승인 기준으로 변환 가능한 항목

---

### A-3 — requirement.md 초안 작성

docs/ 분석 결과 또는 기존 requirement.md 를 기반으로 내용을 작성한다.
템플릿 선택 규칙 및 기본 템플릿은 rules의 `requirement.md 템플릿 규칙` 참조.

**기존 requirement.md 가 있는 경우:**
- 현재 내용을 먼저 읽는다.
- docs/ 분석 결과가 있으면 빈 섹션(`(작성 필요)`)을 채운다.
- docs/ 분석 결과가 없으면 현재 내용을 그대로 유지하고 A-4 확인 요청으로 이동한다.
- 이미 작성된 내용은 덮어쓰지 않고 충돌 시 **질문 도구**로 사용자에게 보고한다.

```
질문: [섬션명] 섹션에 기존 내용과 기획서 분석 내용이 충돌합니다. 어떤 내용으로 업데이트할까요?
      기존 내용: ...
      기획서 분석 내용: ...

선택지:
  - 기존 유지
  - 기획서 기준으로 업데이트
  - 둘 다 유지하고 셈션 병렐으로 작성
```

**requirement.md 가 없거나 템플릿 상태인 경우:**
- rules의 기본 템플릿을 기반으로 내용을 채워 새로 생성한다.

---

### A-4 — requirement.md 저장 및 확인 요청

분석 결과를 `requirement.md` 에 바로 저장한다.
저장 후 **질문 도구**로 아래 질문을 표시하고 사용자 응답을 기다린다.

```
질문: requirement.md 초안이 저장되었습니다. (ai-spec/projects/<feature>/requirement.md)
      파일을 열어 내용을 검토하고 필요한 부분을 직접 수정한 후 안내해주세요.

선택지:
  - 확인 (내용 그대로 todo.md 작성 진행)
  - 수정 완료 (변경사항 반영 후 진행)
```

사용자가 응답하면 A-6 으로 이동한다.

---

### A-6 — UI 미리보기(preview.html) 생성 여부 확인

requirement.md 를 분석하여 UI 추가·변경이 포함된 경우에만 이 단계를 실행한다.
UI 관련 내용이 없으면(순수 API, 배치 등) 이 단계를 건너뛰고 Procedure B 로 이동한다.

**질문 도구**로 preview.html 생성 여부를 확인한다.

```
질문: 이 기능에 UI 변경이 포함되어 있습니다. 구현 전 화면 미리보기(preview.html)를 생성할까요?

선택지:
  - 생성 (브라우저에서 열어볼 수 있는 HTML 초안 작성)
  - 생략 (todo.md 바로 작성)
```

**"생성" 선택 시 — 디자인 시스템 확인**

1. 프로젝트 루트에 `DESIGN.md` 존재 여부를 확인한다.
   - 존재하면 → 해당 파일을 읽어 디자인 시스템을 파악하고, 사용자에게 참고함을 알린다.
   - 존재하지 않으면 → **질문 도구**로 아래 질문을 표시한다.

   ```
   질문: 참고할 디자인 시스템 문서가 있나요?

   선택지:
     - 있음 (경로 또는 내용을 알려주세요)
     - 없음 (기존 UI 파일에서 디자인 패턴을 분석하여 생성)
   ```

   **"없음" 선택 시 — 프로젝트 디자인 패턴 분석**
   1. `ai-spec/_codebase/conventions.md` 에 디자인 관련 내용이 있으면 참고한다.
   2. 기존 UI 파일(컴포넌트, 페이지 등) 2~3개를 읽어 색상·폰트·간격·버튼/카드 등 공통 패턴을 추출한다.
   3. 추출한 패턴을 preview.html 생성에 반영한다.

2. 수집된 정보를 바탕으로 `ai-spec/projects/<feature>/preview.html` 초안을 작성한다.
   - 인라인 CSS만 사용하여 외부 의존성 없이 브라우저에서 바로 열 수 있도록 한다.
   - 주요 화면 레이아웃, 컴포넌트 배치, 인터랙션 흐름을 포함한다.
   - 디자인 시스템 또는 분석한 패턴을 기반으로 색상·타이포그래피·컴포넌트 스타일을 반영한다.

3. 저장 완료 후 OS에 맞는 명령으로 브라우저를 자동으로 연다.
   - macOS: `open ai-spec/projects/<feature>/preview.html`
   - Linux: `xdg-open ai-spec/projects/<feature>/preview.html`
   - Windows: `start ai-spec/projects/<feature>/preview.html`
   - 명령 실행에 실패한 경우 파일 경로를 안내하고 사용자가 직접 열도록 한다.

   이후 **질문 도구**로 검토를 요청한다.

   ```
   질문: preview.html 을 브라우저에서 열었습니다. 확인 후 응답해주세요.

   선택지:
     - 확인 (이 내용으로 todo.md 작성 진행)
     - 수정 완료 (변경사항 반영 후 진행)
   ```

4. 사용자 응답 후 Procedure B 로 이동한다.

**"생략" 선택 시**: Procedure B 로 바로 이동한다.

---

## Procedure B — todo.md 생성

### B-1 — 사전 조건 확인

`requirement.md` 를 읽어 내용이 작성되어 있는지 확인한다.
섹션이 모두 `(작성 필요)` 상태인 경우 사용자에게 알리고 종료한다.

```
requirement.md 가 아직 작성되지 않았습니다.

먼저 요구사항을 작성해주세요.
  - 직접 작성: ai-spec/projects/<feature>/requirement.md
  - docs 분석 요청: "docs 분석해서 requirement 작성해줘"
```

`docs/` 폴더가 존재하고 아직 분석하지 않은 경우 **질문 도구**로 먼저 분석할지 묻는다.

```
질문: docs/ 폴더에 파일이 있습니다. 기획서를 먼저 분석할까요?

선택지:
  - 네, docs 먼저 분석해주세요 (Procedure A 진행)
  - 아니요, 현재 requirement.md 를 기준으로 todo 작성해주세요
```

---

### B-2 — 워크스페이스 탐색 및 _codebase/ 반영

요구사항 구현에 필요한 코드 위치와 스키마를 탐색한다.

**탐색 우선순위 (rules의 `Step 3 — Workspace Discovery` 참조)**

1. `ai-spec/_codebase/index.md` 를 읽어 이 feature와 관련된 모듈을 파악한다.
2. 해당 `_codebase/modules/<domain>.md` 를 읽어 코드 위치·API·패턴을 확인한다.
3. `_codebase/` 에 없는 정보만 최소 범위로 워크스페이스를 직접 탐색한다.
4. 새로 발견한 정보는 즉시 `ai-spec/_codebase/modules/<domain>.md` 에 반영하고 `last-synced.md` 를 갱신한다.

---

### B-3 — todo.md 작성

`requirement.md` 와 `ai-spec/_codebase/` 를 기반으로 `todo.md` 를 작성한다.

**템플릿 선택 규칙**

작성 전에 커스텀 템플릿 존재 여부를 확인한다.

| 확인 경로 | 존재하는 경우 | 없는 경우 |
|-----------|--------------|-----------|
| `ai-spec/templates/todo.md` | 해당 파일의 형식·헤더를 참고하여 작성 | 아래 기본 형식 사용 |

> 커스텀 템플릿은 형식·헤더 참고용이며, 항목 내용은 요구사항에 맞게 AI가 채운다.

**파일 경로**

```
ai-spec/projects/<feature>/todo.md
```

**todo 항목 형식**

```markdown
## [T-01] 항목 제목
- 상태: [ ] TODO
- 작업내용: 구체적인 구현 방법과 힌트
```

각 항목의 상세 설계는 `plan.md` 에서 다룬다. todo 는 작업 식별과 진행 상태 추적 용도로만 사용한다.

---

### B-4 — 완료 보고

```
todo.md 작성이 완료되었습니다.

  ai-spec/projects/<feature>/todo.md

총 N개 항목

다음 단계:
todo 목록을 검토한 후 구현을 시작하세요.
`spec-work` 스킬로 진행할 todo 항목을 선택할 수 있습니다.
```

---

## 처리 규칙

- `requirement.md` 가 없거나 완전히 비어있으면 todo.md 를 생성하지 않는다.
- `docs/` 폴더가 없거나 폴더에 파일이 없으면 문서 분석을 건너뛰고 기존 requirement.md 를 기반으로 작업을 진행한다.
- 분석 결과는 채팅에 출력하지 않고 requirement.md 파일에 직접 저장한다. 파일 경로만 안내하고 사용자가 파일을 검토·수정하도록 한다.
- 이미 작성된 requirement.md 의 내용은 사용자 확인 없이 덮어쓰지 않는다.
- `preview.html` 이 존재하는 경우, B-2(워크스페이스 탐색) 전에 읽어 UI 구조를 탐색 방향에 반영한다.
