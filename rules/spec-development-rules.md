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

> **전역 프로젝트 패턴**은 `.github/copilot-instructions.md` 에 정의되어 있습니다.
> search.md 는 이 파일에서 이미 다루는 일반 패턴은 탐색하지 않으며,
> 해당 feature 에 특정된 실제 코드 위치와 스키마만 기록합니다.

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
  projects/
    project1/
    project2/
```

---

각 feature 폴더는 다음과 같은 구조를 가집니다.

```
feature_name/
  requirement.md
  search.md
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
search.md
todo.md
```

| file | role |
|-----|-----|
| requirement.md | 요구사항 (Single Source of Truth) |
| search.md | feature-specific 코드 위치·스키마 탐색 결과 |
| todo.md | 요구사항을 바탕으로 작업해야 할 할일 목록 |
| `<T-번호>-<요약정보>/plan.md` | todo 항목별 설계 의도·구현 방법·승인 상태 |
| `<T-번호>-<요약정보>/update.md` | todo 항목별 구현 진행 기록 |

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

요구사항 계획에 필요한 핵심 위치만 분석 (가벼운 탐색)
분석 결과를 다음 파일에 기록합니다.

```
PROJECT_SPEC_DIR/search.md
```

---

# Step 4 — todo

요구사항 (requirement.md) 및 분석내용 (search.md) 을 기반으로 다음 파일을 생성합니다.

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

## [T-01E] T-01 E2E 테스트
- 상태: [ ] TODO
- 대상 파일: `tests/<feature>/<항목명>.spec.ts`
- 작업내용: T-01 구현 완료 후 실행. 테스트할 사용자 시나리오와 검증 항목.
```

## E2E 테스트 항목 규칙

- 각 구현 todo 항목 `[T-NN]` 에 대응하는 `[T-NNE]` 항목을 **바로 다음에** 생성합니다.
- `T-NNE` 항목은 대응하는 `T-NN` 구현이 완료된 후에 진행합니다.
- 테스트 파일 경로는 `tests/<feature>/` 하위에 생성합니다.
- Playwright 설정 특성상 plan.md 에 다음을 명시합니다:
  - 의존하는 auth 상태 (`playwright/.auth/user.json`)
  - 선행 필요 조건 (`pnpm serve:build` 실행 여부 등)

## todo 예시

```markdown
## [T-01] orderSVC.getList 메서드 추가
- 상태: [ ] TODO
- 대상 파일: `app/scripts/services/orderSVC.js`
- 작업내용: productSVC.getList 패턴을 참고해서 orderSVC.getList 메서드를 구현합니다.

## [T-01E] T-01 E2E 테스트
- 상태: [ ] TODO
- 대상 파일: `tests/orders/orderList.spec.ts`
- 작업내용: T-01 구현 완료 후 실행. 주문 목록 API 호출 및 목록 렌더링 시나리오 검증.

## [T-02] 주문 목록 컨트롤러 연결
- 상태: [ ] TODO
- 대상 파일: `app/scripts/controllers/orderCtrl.js`
- 작업내용: orderCtrl.js 의 기존 주문 목록 관련 로직(L134 ~)을 수정해서 orderSVC.getList 를 호출하도록 변경합니다.

## [T-02E] T-02 E2E 테스트
- 상태: [ ] TODO
- 대상 파일: `tests/orders/orderList.spec.ts`
- 작업내용: T-02 구현 완료 후 실행. 컨트롤러에서 목록이 정상적으로 바인딩되는지 검증.
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
계획수립시 search.md 내용 외에 추가 분석된 내용이 있다면 PROJECT_SPEC_DIR/search.md 에도 해당 내용을 추가합니다.

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
1. plan.md 와 PROJECT_SPEC_DIR/search.md (예: ai-spec/projects/<feature>/search.md) 를 참조하면서 구현을 진행합니다.
2. 구현시 추가로 분석된 코드 내용 및 프로젝트 구조등의 정보는 PROJECT_SPEC_DIR/search.md 에 추가하여 프로젝트의 코드 구조에 대한 이해가 필요한 다음 작업에서 활용할 수 있도록 합니다.
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
코드 구현으로 인해 PROJECT_SPEC_DIR/search.md 의 코드 위치나 스키마에 변경이 필요한 경우, PROJECT_SPEC_DIR/search.md 를 업데이트 합니다.

# Step 9 — todo 항목이 추가되는 경우

todo.md 의 항목이 추가되어 사용자의 추가개발 요청이 있을경우 Step 5 ~ Step 8 을 반복합니다.

