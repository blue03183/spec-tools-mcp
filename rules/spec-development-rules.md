# Spec Development Rules
## Spec-Driven Development Protocol

이 저장소의 모든 개발은 **Spec-Driven Development** 방식으로 진행합니다.

AI는 항상 다음 순서를 따릅니다.

```
요구사항 분석 -> (기획서 분석) → 코드 구조 탐색 → todo 작성  → todo 별 작업 설계 계획 → 승인 → 구현 → todo 완료 보고 → 다음 todo 진행
```

코드 작성 전 **반드시 spec 문서를 먼저 작성합니다.**

> **모든 분석·계획·컨텍스트는 MD 파일에만 기록합니다.**
> AI 는 memory tool(세션 메모리, 리포지토리 메모리 등)을 spec 작업에 사용하지 않습니다.
> 채팅은 기록 저장소가 아닙니다. 결정과 상태는 반드시 spec MD 파일에 남깁니다.

---

# Spec Workspace

모든 spec 문서는 다음 위치에서 관리됩니다.

```
/ai-spec
```

각 기능은 **ai-spec/projects/feature_name** 형태의 독립된 spec 폴더를 사용합니다.

예시
```
ai-spec/
  _codebase/              ← 코드베이스 전체 위키 (프로젝트 공용)
    index.md              ← 전체 구조 맵, tech stack, 모듈-경로 매핑
    last-synced.md        ← 마지막 분석 시점 (git hash + 트리거)
    modules/
      <domain>.md         ← 도메인별 상세: 주요 파일, 핵심 API, 패턴, 의존성
    conventions.md        ← 공통 컨벤션, 네이밍 규칙, 아키텍처 패턴
  projects/
    project1/
    project2/
```

---

각 feature 폴더는 다음과 같은 구조를 가집니다.

```
feature_name/
  requirement.md
  todo.md
  docs/ (기획서 원문 파일 보관 폴더, 존재 시)
  <task 번호>-<요약정보>/
    plan.md
    update.md
```

---

# Requirement Source

프로젝트의 요구사항은 채팅이 아닌 다음 파일에서 관리됩니다.

```
ai-spec/projects/<feature>/requirement.md
```

이 문서는 **Single Source of Truth** 입니다.
AI는 항상 **requirement.md를 먼저 읽어야 합니다.**
`PROJECT_SPEC_DIR` = requirement.md 가 위치한 폴더

---

# Spec Files

각 feature 폴더는 다음 파일을 가집니다.

```
requirement.md
todo.md
```

| file | role |
|-----|-----|
| requirement.md | 요구사항 (Single Source of Truth) |
| todo.md | 요구사항을 바탕으로 작업해야 할 할일 목록 |
| `<T-번호>-<요약정보>/plan.md` | todo 항목별 설계 의도·구현 방법·승인 상태 |
| `<T-번호>-<요약정보>/update.md` | todo 항목별 구현 진행 기록 |

**프로젝트 공용 파일 (`ai-spec/_codebase/`)**

| file | role |
|-----|-----|
| `_codebase/index.md` | 전체 디렉토리 구조, tech stack, 모듈-경로 매핑 테이블 |
| `_codebase/modules/<domain>.md` | 도메인별 주요 파일, 핵심 API, 패턴, 외부 의존성 |
| `_codebase/conventions.md` | 공통 컨벤션, 네이밍 규칙, 아키텍처 패턴 |
| `_codebase/last-synced.md` | 마지막 분석 시점 (git hash + 트리거 + 업데이트 모듈) |

---

# _codebase/ — 코드베이스 위키

코드베이스 전체에 대한 공용 인덱스로, 모든 feature 작업에서 반복 탐색을 방지한다.
`spec-init` 최초 실행 시 생성되며, `spec-work` Step 6 완료 시 영향받은 모듈을 갱신한다.

## index.md 포맷

```markdown
# 코드베이스 인덱스

## 프로젝트 개요
- 기술 스택: ...
- 진입점: ...
- 주요 의존성: ...

## 모듈 맵
| 경로 패턴 | 모듈 | 설명 |
|-----------|------|------|
| `src/auth/**` | [auth](modules/auth.md) | 인증/인가 |
| `src/orders/**` | [orders](modules/orders.md) | 주문 처리 |

## 디렉토리 구조
(트리 형식, 각 디렉토리에 한 줄 설명)
```

## modules/\<domain\>.md 포맷

```markdown
# <모듈명> 모듈

## 역할
(이 모듈이 담당하는 도메인)

## 주요 파일
| 파일 | 역할 |
|------|------|
| `src/auth/auth.service.ts` | 인증 핵심 로직 |

## 핵심 API
| 심볼 | 타입 | 파일 | 설명 |
|------|------|------|------|
| `AuthService` | class | `src/auth/auth.service.ts` | ... |

## 모듈 패턴
(이 모듈 고유의 코딩 패턴, 컨벤션)

## 외부 의존성
| 대상 | 위치 | 용도 |
|------|------|------|
| `JwtService` | `@nestjs/jwt` | JWT 토큰 발급 |

## 마지막 업데이트
YYYY-MM-DD — <트리거 (예: spec-init / spec-work T-03)>
```

## last-synced.md 포맷

```markdown
# 동기화 상태

## 마지막 동기화
- 일시: YYYY-MM-DD
- Git Hash: <hash>
- 트리거: spec-init / spec-work T-NN
- 업데이트된 모듈: <모듈명 목록>

## 이력
| 일시 | Git Hash | 트리거 | 업데이트 모듈 |
|------|----------|--------|--------------|
| 2026-05-14 | abc123 | spec-init | 전체 |
```

## _codebase/ 갱신 규칙

### spec-init 실행 시
- `_codebase/` 없음 → 전체 코드베이스 분석 후 전체 모듈 생성
- `_codebase/` 있음 → `last-synced.md` 에서 git hash 읽기 → `git log <hash>..HEAD --name-only` 로 변경 파일 확인 → `index.md` 모듈 맵 기준으로 영향받는 모듈만 재분석

### spec-work Step 6 완료 시
- `update.md` 변경 파일 목록 기준으로 영향받는 모듈 파악
- 해당 `modules/<domain>.md` 업데이트 (신규 심볼, 변경된 API, 패턴 반영)
- 신규 파일/디렉토리가 생긴 경우 `index.md` 모듈 맵도 갱신
- `last-synced.md` 갱신 (일시, git hash, 트리거, 업데이트 모듈)

---

# Common — 스킬 공통 규칙

## 스킬 진입 시 공통 사전 조건

모든 스킬은 이 문서(rules)를 숙지한 상태에서 Procedure를 진행한다.

**`get_rules` 호출 규칙**
- 현재 세션에서 아직 `get_rules`를 호출하지 않은 경우에만 호출한다.
- 이미 호출하여 규칙이 컨텍스트에 있는 경우 재호출하지 않는다.

**`spec_status` 호출 규칙**
- 세션에서 처음으로 `spec_work` 를 실행하기 전, feature 가 컨텍스트에 이미 확인된 경우에만 `spec_status feature=<feature>` 를 호출한다.
- feature 가 불명확한 경우에는 spec_status 를 호출하지 않고 AI 가 직접 projects 폴더를 확인하여 사용자에게 선택을 요청한다.
- 이미 호출하여 현황이 컨텍스트에 있는 경우 재호출하지 않는다.

## 질문 도구 선택

실행 환경에 따라 아래 도구를 사용한다.

| 환경 | 사용 도구 |
|------|-----------|
| Copilot (VS Code) | `vscode_askQuestions` |
| Claude Code | `AskUserQuestion` |

---

# requirement.md 템플릿 규칙

## 커스텀 템플릿 확인

`requirement.md` 생성 전 커스텀 템플릿 존재 여부를 먼저 확인한다.

| 확인 경로 | 존재하는 경우 | 없는 경우 |
|-----------|--------------|-----------|
| `ai-spec/templates/requirement.md` | 해당 파일 내용을 템플릿으로 사용 | 아래 기본 템플릿 사용 |

> 커스텀 템플릿을 사용하더라도 `requirement.md` 첫 줄의 get_rules 참조 지시문은 반드시 포함한다.

## 기본 템플릿

```markdown
# 이 문서로 작업 시작 전, spec-tools-mcp 의 get_rules 도구를 호출하여 개발 규칙을 확인하세요.

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

`docs/` 폴더가 생성된 경우 "참고 문서" 섹션 안내 문구:

```markdown
## 참고 문서
<!-- docs/ 폴더에 파일을 넣은 후 spec-todo 스킬로 분석을 요청하세요 -->
(없음)
```

`docs/` 폴더에 파일이 확인된 경우 파일명을 목록으로 기재한다:

```markdown
## 참고 문서
- docs/기획서_v1.pdf
- docs/화면설계서.png
```

---

# Step 1 — Requirement Analysis

```
PROJECT_SPEC_DIR/requirement.md
```

requirement.md 내용을 바탕으로 다음을 분석합니다.

- 기능 목표
- 사용자 시나리오
- 승인 기준

requirement.md가 없으면 **구현하지 않습니다.**

---

# Step 2 — Design Document Analysis (docs/ 존재 시)

`PROJECT_SPEC_DIR/docs/` 폴더가 존재하는 경우, **Step 2 진행 전에 반드시 먼저 수행합니다.**

```
PROJECT_SPEC_DIR/docs/
```

해당 폴더의 파일(PDF, 이미지, 문서 등)은 **기획서**입니다.
requirement.md 는 기획서를 바탕으로 작성된 요약본일 수 있으므로,
**기획서 원문을 우선 기준으로 삼아 requirement.md 와 대조합니다.**

첨부 파일을 분석한 내용을 바탕으로 요구사항에서 추가해야 할 항목이 있는지 확인하고, 내용 수정이 필요한경우 requirement.md 하단에 문서를 바탕으로 추가된 내용을 사용자가 알수 있게 추가 후 사용자에게 requirement.md 수정 여부를 알려줍니다.

---

# Step 3 — Workspace Discovery

탐색 우선순위를 반드시 아래 순서로 따른다. 상위 단계에서 충분한 정보를 얻은 경우 하위 단계로 내려가지 않는다.

**1단계 — `_codebase/` 위키 참조 (프로젝트 공용)**
`ai-spec/_codebase/index.md` 를 읽어 관련 모듈을 파악하고
해당 `modules/<domain>.md` 를 읽는다. 여기서 충분한 정보를 얻으면 워크스페이스를 탐색하지 않는다.

**2단계 — 워크스페이스 직접 탐색 (최후 수단)**
1단계에서 정보가 부족한 경우에만 최소 범위로 탐색한다.
탐색으로 새로 파악한 정보는 즉시 `ai-spec/_codebase/modules/<domain>.md` 에 반영한다.

```
ai-spec/_codebase/
```

---

# Step 4 — todo

요구사항 (requirement.md) 을 기반으로 다음 파일을 생성합니다.

```
PROJECT_SPEC_DIR/todo.md
```

## todo.md 역할: TODO list + Self-contained Implementation Spec

todo.md 는 단순 체크리스트가 아닌 **Self-contained 구현 명세**입니다.
각 todo 항목은 세션이 중단·재개되어도 AI 가 독립적으로 실행 가능해야 합니다.

## todo 항목 형식

```markdown
## [T-01] 항목 제목
- 상태: [ ] TODO
- 대상 파일: `경로/파일명.ts`
- 작업내용: 구체적인 구현 방법과 힌트
```

## todo 상태값

| 상태 | 의미 |
|------|------|
| `[ ] TODO` | 아직 시작하지 않은 항목 |
| `[ ] IN PROGRESS` | 구현이 시작되었으나 완료되지 않은 항목 (중단 포함) |
| `[x] 완료` | 구현 및 검수 정보 기록까지 완료된 항목 |

에이전트는 구현을 시작하는 순간 해당 항목의 상태를 `[ ] IN PROGRESS` 로 변경한다.
세션이 중단되어도 `IN PROGRESS` 상태를 보고 중단된 작업을 식별하고 재개할 수 있다.

## todo 예시

```markdown
## [T-01] getList 메서드 추가
- 상태: [ ] TODO
- 작업내용: product.getList 패턴을 참고해서 order.getList 메서드를 구현합니다.
```

---

# Step 5 — Implementation Planning

완료상태가 아닌 각 todo 항목별로 <todo 번호 + 요약정보>로 폴더를 생성하고 폴더 하위에 plan.md 파일을 생성합니다.

```
PROJECT_SPEC_DIR/<todo 번호>-<요약정보>/plan.md
```

## plan.md 역할: WHY / WHAT

plan.md 는 **설계 의도와 기술 결정의 근거**를 담습니다.

plan.md 포함 내용

- 설계 목표
- 어떻게 구현할지
- Approval Status
- User Feedback

Approval Status 기본값

```
[대기]
```

가능한 상태

```
[대기] [수정] [승인]
```

Approval Status 와 User Feedback 은 페이지 제일 하단으로 위치합니다.
계획수립시 추가로 분석된 코드 구조·패턴은 즉시 `ai-spec/_codebase/modules/<domain>.md` 에 반영합니다.

---

# Step 6 — Approval Gate

모든 todo 항목의 plan.md 가 생성되었다면 첫번째 todo 항목의 plan.md 의 승인 절차를 진행합니다.
다음 상태가 아니면 **코드를 작성하지 않습니다.**

```
Approval Status = [승인]
```

## 승인 요청 형식

plan.md 작성 또는 수정 후 **plan.md 전체를 채팅에 출력하지 않습니다.**
계획이 수립완료되었음을 사용자에게 알리고 다음 문장으로 마칩니다.
사용자가 plan.md 를 확인하면 되므로 계획 요약정보도 출력하지 않습니다.

```
plan.md 의 내용 확인 후 아래 명령으로 응답해주세요.

  승인   → 구현을 시작합니다
  수정   → plan.md 확인 -> User Feedback 에 수정했으면 하는 내용을 입력 -> Approval Status 를 [수정] 으로 변경 -> 에이전트에 plan.md 수정 완료 알림 (예: "plan.md 수정 완료") -> AI 가 변경사항 확인 후 승인 재요청
```


## 승인 신호

- 사용자가 `승인`
- 사용자가 `진행해`
- plan.md Approval Status 를 `[승인]` 로 직접 변경

## 승인 신호 수신 시 처리 (필수)

사용자가 채팅으로 `승인` 또는 `진행해` 를 입력한 경우, 구현으로 넘어가기 전에
plan.md 의 Approval Status 를 `[승인]` 으로 업데이트한다.
(사용자가 직접 변경한 경우 이 단계를 생략한다.)

## 수정 요청 처리

수정은 **채팅이 아닌 plan.md 파일 직접 수정**으로 진행합니다.

```
1. 사용자가 plan.md 를 직접 수정
2. 사용자가 채팅에 "수정" 또는 "계획 변경(수정)사항 확인" 입력
3. Agent 가 plan.md 변경사항 확인
4. 확인된 변경사항을 바탕으로 계획 재수립
5. 승인 재요청
```

> 사용자가 plan.md 에 수정 내용을 직접 기술하므로 채팅으로 요구사항을 재전달할 필요가 없습니다.

---

# Step 7 — Implementation

## 작업 절차

```
1. plan.md 와 `ai-spec/_codebase/modules/<domain>.md` 를 참조하면서 구현을 진행합니다.
2. 구현시 추가로 분석된 코드 내용 및 프로젝트 구조등의 정보는 `ai-spec/_codebase/modules/<domain>.md` 에 추가하여 다음 작업에서 활용할 수 있도록 합니다.
3. 진행상황은 같은 경로의 update.md 파일에 기록합니다. (예: ai-spec/projects/<feature>/T-01-항목명/update.md) - 해당 파일이 없는경우 파일을 생성합니다.
4. update.md 의 작업 목록별 작업이 완료될때마다 작업 목록에 체크 표시([x])를 합니다.
   (작업이 중간에 중단되어도 update.md 내용을 바탕으로 중단된 작업을 이어나갈 수 있도록)
5. 모든 구현이 완료되면 검수에 필요한 정보를 update.md 에 기록합니다. (아래 update.md 검수 섹션 참고)
6. 모든 작업이 완료되면 상위 경로의 todo.md 에서 해당 작업의 상태를 [x] 완료로 변경합니다.
```

## update.md 구조

update.md 는 두 섹션으로 구성됩니다.

### 1. 작업 목록 섹션 (구현 중 관리)

구현 진행 중 작업 단위별로 체크리스트를 관리합니다.

```markdown
## 작업 목록

- [ ] 작업 항목 A
- [ ] 작업 항목 B
- [x] 완료된 항목 C
```

### 2. 검수 섹션 (구현 완료 후 작성)

모든 구현이 완료된 후 **다른 세션에서 검수가 가능하도록** 다음 내용을 작성합니다.

```markdown
## 검수

### 참조 문서
- todo.md: `PROJECT_SPEC_DIR/todo.md` 의 대상 작업 항목 (예: [T-01])
- plan.md: `PROJECT_SPEC_DIR/<T-번호>-<요약정보>/plan.md`

### 변경 파일 목록
| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|-----------|-----------|----------------|
| `경로/파일명.ts` | 신규/수정/삭제 | 변경한 내용 요약 |

### 검수 항목
todo.md 의 승인 기준 항목별로 대응하는 구현 내용을 기술합니다.

- [ ] [승인 기준 항목]: 어느 파일의 어느 부분에서 어떻게 구현되었는지
- [ ] [승인 기준 항목]: ...

### 검수 방법
검수자가 직접 확인할 수 있는 방법을 기술합니다. (실행 방법, 확인할 화면/동작 등)
```

> 검수 세션 진입 시: `todo.md` → `plan.md` → `update.md` 순서로 읽고 검수 항목을 확인합니다.

# Step 8 — Reporting & Next Steps

작업이 완료되면 사용자에게 보고하고 다음 todo 가 있는경우 다음 작업을 진행할지 사용자에게 묻습니다.
구현으로 인해 변경된 파일 구조·코드 위치·스키마·의존성을 `ai-spec/_codebase/modules/<domain>.md` 에 **반드시** 업데이트합니다.
`_codebase/` 는 다음 task 의 유일한 코드 위치 참조 소스이므로 항상 최신 상태를 유지해야 합니다.

# Step 9 — todo 항목이 추가되는 경우

todo.md 의 항목이 추가되어 사용자의 추가개발 요청이 있을경우 Step 5 ~ Step 8 을 반복합니다.

