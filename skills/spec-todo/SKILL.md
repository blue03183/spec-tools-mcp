---
name: spec-todo
description: "Spec-Driven Development의 요구사항 분석 및 todo 생성 스킬. docs/ 폴더의 기획서를 분석하여 requirement.md 를 작성·수정하고, 워크스페이스 탐색 후 todo.md 를 생성한다. docs 분석, requirement 작성, 기획서 분석, todo 작성, todo 생성 요청 시 사용한다."
argument-hint: "feature 폴더명 (예: seller-dashboard, order-management). 생략 시 AI가 feature 목록을 확인하여 선택을 요청한다."
---

# Spec Todo 스킬

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

## Procedure A — docs 분석 후 requirement.md 작성

### A-1 — feature 폴더 확인

인자로 feature명이 전달된 경우 그대로 사용한다.
전달되지 않은 경우 `ai-spec/projects/` 하위 폴더 목록을 확인하고
하나라면 자동 선택, 여러 개라면 **vscode_askQuestions 도구**로 선택을 요청한다.

```
질문: 어떤 feature 를 진행할까요?

선택지: [폴더 목록 동적 생성]
  - seller-dashboard
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

**기존 requirement.md 가 있는 경우:**
- 현재 내용을 먼저 읽는다.
- docs/ 분석 결과가 있으면 빈 섹션(`(작성 필요)`)을 채운다.
- docs/ 분석 결과가 없으면 현재 내용을 그대로 유지하고 A-4 확인 요청으로 이동한다.
- 이미 작성된 내용은 덮어쓰지 않고 충돌 시 **vscode_askQuestions 도구**로 사용자에게 보고한다.

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
- 아래 템플릿을 기반으로 내용을 채워 새로 생성한다.

```markdown
# ai-spec/rules/spec-development-rules.md 파일의 규칙을 준수하여 작업을 진행해주세요.

# <Feature명> 요구사항

## 기능 목표
(작성 필요)

## 사용자 시나리오
(작성 필요)

## 승인 기준
- [ ] (작성 필요)

## 참고 문서
<!-- docs/ 폴더에 파일이 있는 경우 아래에 목록을 기재합니다 -->
(없음)
```

`docs/` 폴더에 파일이 확인된 경우 "참고 문서" 섹션에 파일명을 목록으로 기재한다.

```markdown
## 참고 문서
- docs/기획서_v1.pdf
- docs/화면설계서.png
```

---

### A-4 — requirement.md 저장 및 확인 요청

분석 결과를 `requirement.md` 에 바로 저장한다.
저장 후 **vscode_askQuestions 도구**로 아래 질문을 표시하고 사용자 응답을 기다린다.

```
질문: requirement.md 초안이 저장되었습니다. (ai-spec/projects/<feature>/requirement.md)
      파일을 열어 내용을 검토하고 필요한 부분을 직접 수정한 후 안내해주세요.

선택지:
  - 확인 (내용 그대로 todo.md 작성 진행)
  - 수정 완료 (변경사항 반영 후 진행)
```

사용자가 응답하면 A-5 로 이동한다.

---

### A-5 — 완료 보고

```
requirement.md 작성이 완료되었습니다.

  ai-spec/projects/<feature>/requirement.md

다음 단계:
요구사항을 검토한 후 todo 목록을 생성하세요.

  "ai-spec/projects/<feature> todo 작성해줘"
```

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

`docs/` 폴더가 존재하고 아직 분석하지 않은 경우 **vscode_askQuestions 도구**로 먼저 분석할지 묻는다.

```
질문: docs/ 폴더에 파일이 있습니다. 기획서를 먼저 분석할까요?

선택지:
  - 네, docs 먼저 분석해주세요 (Procedure A 진행)
  - 아니요, 현재 requirement.md 를 기준으로 todo 작성해주세요
```

---

### B-2 — 워크스페이스 탐색 (search.md 작성)

요구사항 구현에 필요한 코드 위치와 스키마를 탐색한다.
탐색 결과를 `ai-spec/projects/<feature>/search.md` 에 기록한다.

**탐색 범위**
- 요구사항과 관련된 기존 파일·컴포넌트·서비스 위치
- 참고할 수 있는 유사 구현 패턴
- 데이터 스키마·타입 정의

**탐색 규칙**
- 전역 프로젝트 패턴 (`.github/copilot-instructions.md` 에서 다루는 내용)은 search.md 에 기록하지 않는다.
- 해당 feature 에 특정된 실제 코드 위치와 스키마만 기록한다.
- 가벼운 탐색으로 시작하고 필요한 경우만 심층 탐색한다.

**search.md 템플릿**

```markdown
# <Feature명> 코드 탐색

## 관련 파일 위치
| 역할 | 파일 경로 | 비고 |
|------|-----------|------|
| (예) 서비스 | `app/scripts/services/orderSVC.js` | getList 패턴 참고 |

## 데이터 스키마
(관련 타입·인터페이스 정의 위치 및 내용)

## 참고 패턴
(유사 구현 사례 및 위치)
```

---

### B-3 — todo.md 작성

`requirement.md` 와 `search.md` 를 기반으로 `todo.md` 를 작성한다.

**파일 경로**

```
ai-spec/projects/<feature>/todo.md
```

**todo 항목 형식**

```markdown
## [T-01] 항목 제목
- 상태: [ ] TODO
- 대상 파일: `경로/파일명.ts`
- 작업내용: 구체적인 구현 방법과 힌트
```

**Self-contained 원칙**
각 todo 항목은 세션이 중단·재개되어도 AI 가 독립적으로 실행 가능하도록 작업 내용을 구체적으로 기술한다.

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
- `requirement.md` 첫 줄에는 반드시 spec-development-rules.md 참조 지시문이 포함되어야 한다. 없는 경우 추가한다.
- `docs/` 폴더가 없거나 폴더에 파일이 없으면 문서 분석을 건너뛰고 기존 requirement.md 를 기반으로 작업을 진행한다.
- 분석 결과는 채팅에 출력하지 않고 requirement.md 파일에 직접 저장한다. 파일 경로만 안내하고 사용자가 파일을 검토·수정하도록 한다.
- 이미 작성된 requirement.md 의 내용은 사용자 확인 없이 덮어쓰지 않는다.
