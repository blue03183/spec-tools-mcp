---
name: spec-work
description: "Spec-Driven Development의 todo 기반 작업 실행 스킬. todo.md 의 항목을 순서대로 plan.md 작성 → 승인 → 구현 → update.md 기록 → 완료 보고 순으로 진행한다. 구현 시작, todo 진행, plan 작성, 승인 요청, 작업 재개, 다음 todo 진행 요청 시 사용한다."
argument-hint: "feature 폴더명 또는 todo 항목 번호 (예: dashboard, T-01). 생략 시 AI가 todo.md 를 확인하여 다음 작업을 제안한다."
---

# Spec Work 스킬

## 개요

`ai-spec/projects/<feature>/todo.md` 의 항목을 순서대로 실행하는 스킬이다.
각 todo 항목에 대해 **계획 수립 → 승인 → 구현 → 완료 보고** 사이클을 반복한다.

spec-development-rules.md 의 Step 5 ~ Step 9 를 커버한다.

## When to Use

- todo.md 가 생성된 이후 실제 구현을 시작할 때
- 특정 todo 항목의 plan.md 를 작성하고 싶을 때
- 승인 후 구현을 진행할 때
- 중단된 작업을 이어서 진행할 때
- 다음 todo 항목으로 넘어갈 때

트리거 문장 예시
```
구현 시작해줘
T-01 진행해줘
다음 todo 진행해
작업 재개해줘
plan 작성해줘
```

---

## 사전 조건 확인

스킬 진입 시 가장 먼저 `get_rules` MCP 도구를 호출하여 모든 규칙을 숙지한다.
이후 다음 파일이 존재하는지 확인한다.

**질문 도구 선택**: 이 문서에서 "질문 도구"는 실행 환경에 따라 아래 도구를 사용한다.

| 환경 | 사용 도구 |
|------|-----------|
| Copilot (VS Code) | `vscode_askQuestions` |
| Claude Code | `AskUserQuestion` |

| 파일 | 없을 경우 처리 |
|------|--------------|
| `get_rules` MCP 도구 | 호출하여 규칙 숙지 (필수) |
| `ai-spec/projects/<feature>/requirement.md` | 사용자에게 spec-init 스킬로 먼저 초기화하도록 안내 |
| `ai-spec/projects/<feature>/todo.md` | 사용자에게 todo.md 가 없음을 알리고 spec-init 스킬로 진행하도록 안내 |

---

## Procedure — todo 항목 실행

### Step 1 — Feature 및 대상 todo 확인

인자로 feature명 또는 todo 번호가 전달된 경우 그대로 사용한다.
전달되지 않은 경우 `ai-spec/projects/` 하위 폴더 목록을 확인하고
활성 feature 가 하나라면 자동 선택, 여러 개라면 사용자에게 선택을 요청한다.

**대상 todo 결정 규칙**

1. todo 번호가 명시된 경우 → 해당 항목 선택
2. 명시되지 않은 경우 → `todo.md` 를 읽어 **상태가 `[ ] TODO` 인 첫 번째 항목** 선택
3. 진행 중인 항목(`[ ] IN PROGRESS` 또는 update.md 가 이미 존재하는 항목)이 있으면 해당 항목을 우선 제안

대상 todo 가 결정되면 **질문 도구**로 확인을 요청한다.

```
질문: 진행할 todo 항목을 확인해주세요.
      [T-01] orderSVC.getList 메서드 추가

선택지:
  - 이 항목으로 진행
  - 다른 항목 선택 (todo 번호를 직접 입력)
  [직접 입력 허용]
```

---

### Step 2 — 기존 plan.md 확인

`PROJECT_SPEC_DIR/<T-번호>-<요약정보>/plan.md` 가 이미 존재하는지 확인한다.

| 상태 | 처리 |
|------|------|
| plan.md 없음 | Step 3 으로 이동 (plan.md 작성) |
| plan.md 있고 Approval Status = `[대기]` | Step 4 로 이동 (승인 요청) |
| plan.md 있고 Approval Status = `[수정]` | Step 3 으로 이동 (plan.md 재작성) |
| plan.md 있고 Approval Status = `[승인]` | Step 5 로 이동 (구현) |

update.md 가 존재하고 미완료 항목이 있는 경우 → Step 5 로 이동 (작업 재개)

---

### Step 3 — plan.md 작성

`requirement.md`, `search.md`, `todo.md` 를 읽어 해당 todo 항목의 plan.md 를 작성한다.

**search.md 우선 확인 규칙 (필수)**
1. `PROJECT_SPEC_DIR/search.md` 를 **반드시 먼저** 읽어 필요한 코드 위치·스키마 정보를 확인한다.
2. search.md 에 해당 todo 구현에 충분한 정보가 있으면 → 워크스페이스 탐색을 하지 않는다.
3. search.md 에 정보가 없거나 부족한 경우에만 최소 범위로 워크스페이스를 탐색한다.
4. 탐색으로 새로 파악한 코드 위치·스키마는 즉시 `search.md` 에 추가 기록한다.

**plan.md 경로**

```
PROJECT_SPEC_DIR/<T-번호>-<요약정보>/plan.md
```

예시: `ai-spec/projects/dashboard/T-01-order-getList/plan.md`

**plan.md 템플릿**

```markdown
# [T-NN] 항목 제목

## 설계 목표
(이 todo 가 달성해야 하는 목표)

## 구현 방법
(어떻게 구현할지 구체적으로 기술)

### 참조 코드
- 참고할 기존 파일/패턴: `경로/파일명`

### 변경 대상
| 파일 | 변경 유형 | 작업 내용 |
|------|-----------|-----------|
| `경로/파일명.ts` | 신규/수정 | 구체적인 변경 내용 |

## 고려 사항
(예외 케이스, 의존성, 주의점 등)

---

## Approval Status
[대기]

## User Feedback
(없음)
```

plan.md 작성 완료 후 Step 4 로 이동한다.

---

### Step 4 — 승인 요청

plan.md 작성 또는 수정 완료 후 **채팅에 plan.md 전체 내용을 출력하지 않는다.**
**질문 도구**로 아래 질문을 표시하고 사용자 응답을 기다린다.

```
질문: [T-NN] <항목 제목> plan.md 작성이 완료되었습니다. (PROJECT_SPEC_DIR/<T-번호>-<요약정보>/plan.md)
      파일을 열어 내용을 검토한 후 응답해주세요.

선택지:
  - 승인 (구현 시작)
  - 수정 필요 (plan.md 의 User Feedback 섹션에 수정 내용 입력 후 Approval Status 를 [수정] 으로 변경 → "수정 완료" 입력)
```

**승인 신호 감지**
- 사용자가 `승인` 또는 `진행해` 입력
- plan.md 의 Approval Status 가 `[승인]` 으로 직접 변경된 경우

**수정 요청 처리**
1. 사용자가 plan.md 를 직접 수정하고 "수정 완료" 입력
2. plan.md 변경사항 확인 (User Feedback 및 Approval Status 확인)
3. 변경사항을 반영하여 plan.md 재작성
4. Approval Status 를 `[대기]` 로 초기화
5. 승인 재요청

승인 신호 수신 시 Step 5 로 이동한다.

---

### Step 5 — 구현

plan.md 와 `PROJECT_SPEC_DIR/search.md` 를 참조하여 구현을 진행한다.

**구현 시작 전 update.md 확인**

`PROJECT_SPEC_DIR/<T-번호>-<요약정보>/update.md` 가 이미 존재하는 경우
완료된 항목(`[x]`)을 건너뛰고 미완료 항목부터 이어서 진행한다.

**update.md 생성 (없는 경우)**

```markdown
## 작업 목록

- [ ] 작업 항목 A
- [ ] 작업 항목 B
```

**구현 진행 규칙**
- 각 작업 단위가 완료될 때마다 update.md 의 해당 항목에 체크 표시(`[x]`)
- 구현 중 추가로 파악된 코드 위치·스키마는 즉시 `PROJECT_SPEC_DIR/search.md` 에 추가한다 (누락 금지)
- 작업이 중단되어도 update.md 를 보고 재개 가능하도록 충분히 기록

모든 구현 완료 시 Step 6 으로 이동한다.

---

### Step 6 — 검수 정보 기록

구현 완료 후 update.md 에 검수 섹션을 추가한다.

```markdown
## 검수

### 참조 문서
- todo.md: `PROJECT_SPEC_DIR/todo.md` 의 [T-NN]
- plan.md: `PROJECT_SPEC_DIR/<T-번호>-<요약정보>/plan.md`

### 변경 파일 목록
| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|-----------|-----------|----------------|
| `경로/파일명.ts` | 신규/수정/삭제 | 변경 내용 요약 |

### 검수 항목
- [ ] [승인 기준]: 구현 위치 및 방법
- [ ] [승인 기준]: ...

### 검수 방법
(실행 방법, 확인할 화면/동작 등)
```

`todo.md` 에서 해당 항목의 상태를 `[x] 완료` 로 변경한다.

**search.md 업데이트 (필수)**
구현으로 인해 변경된 파일 구조·코드 위치·스키마·의존성을 `PROJECT_SPEC_DIR/search.md` 에 반드시 반영한다.
다음 todo 작업 시 search.md 만 읽어도 현재 프로젝트 상태를 파악할 수 있어야 한다.

---

### Step 7 — 완료 보고 및 다음 단계 안내

```
[T-NN] <항목 제목> 구현이 완료되었습니다.

변경 파일:
  - 경로/파일명.ts (신규/수정)

검수 정보가 update.md 에 기록되었습니다.
  ai-spec/projects/<feature>/<T-번호>-<요약정보>/update.md
```

**다음 todo 확인**

todo.md 에서 미완료 항목이 있는 경우 **질문 도구**로 다음 진행 여부를 묻는다.

```
질문: 다음 todo 항목이 있습니다. 이어서 진행할까요?
      [T-02] <다음 항목 제목>

선택지:
  - 이어서 진행 (T-02 plan.md 작성)
  - 중단
```

미완료 항목이 없는 경우:

```
todo.md 의 모든 항목이 완료되었습니다.

  ai-spec/projects/<feature>/todo.md
```

---

## 처리 규칙

- 스킬 시작 시 반드시 `get_rules` MCP 도구를 호출하고 모든 절차를 준수한다.
- `requirement.md` 가 없으면 구현을 시작하지 않는다.
- `todo.md` 가 없으면 구현을 시작하지 않는다.
- plan.md Approval Status 가 `[승인]` 이 아니면 코드를 작성하지 않는다.
- plan.md 전체 내용은 채팅에 출력하지 않는다. 파일 경로만 안내한다.
- **plan.md 작성 전 `search.md` 를 반드시 먼저 읽는다. search.md 에 충분한 정보가 있으면 워크스페이스를 직접 탐색하지 않는다.**
- **구현 완료 후 변경된 파일 구조·코드 위치·스키마를 `search.md` 에 반드시 업데이트한다. (다음 task 의 유일한 참조 소스)**
- update.md 는 세션이 중단되어도 재개 가능한 수준으로 상세히 기록한다.
- E2E 테스트 항목(`T-NNE`)은 대응하는 구현 항목(`T-NN`) 완료 후에 진행한다.
