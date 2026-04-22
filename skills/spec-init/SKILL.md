---
name: spec-init
description: "Spec-Driven Development를 위한 프로젝트 초기화 스킬. ai-spec/projects 폴더 하위에 feature 폴더 구조를 확인·생성하고, requirement.md 템플릿과 docs/ 폴더를 셋업한다. spec 초기화, spec 생성, 새 기능 시작 요청 시 사용한다."
argument-hint: "feature 폴더명 (예: seller-dashboard, order-management). 생략 시 AI가 요구사항을 먼저 인터뷰한다."
---

# Spec 프로젝트 초기화 스킬

## 개요

`ai-spec/projects/<feature>/` 폴더 구조를 확인하고 생성한다.
`requirement.md` 템플릿과 필요 시 `docs/` 폴더를 셋업하는 것까지가 이 스킬의 범위이다.

docs 분석 및 requirement.md 작성, todo.md 생성은 **spec-todo 스킬**에서 담당한다.

## When to Use

- 새로운 기능 개발을 spec 기반으로 시작할 때
- `ai-spec/projects/<feature>/` 폴더와 `requirement.md` 를 처음 만들 때
- 기획서나 참고 문서를 보관할 `docs/` 폴더를 준비하고 싶을 때

---

## Procedure — 신규 프로젝트 초기화

### Step 1 — Feature명 확인

인자(argument)로 feature명이 전달된 경우 그대로 사용한다.
전달되지 않은 경우 다음 질문으로 인터뷰한다. (vscode_askQuestions 도구 사용)

```
1. Feature명 (폴더명으로 사용됩니다. 영문 소문자, 하이픈 사용 권장)
   예) seller-dashboard, order-bulk-edit, keyword-analysis

2. 기능 요약 (한 줄로 설명)

3. 기획서나 참고 문서(PDF, 이미지 등)가 있나요? [있음 / 없음]
```

feature명은 `ai-spec/` 하위 폴더명으로 사용되므로 **영문 소문자 + 하이픈** 형식으로 정리한다.
사용자가 한글로 입력하면 적절한 영문명을 제안하고 확인받는다.

---

### Step 2 — 폴더 구조 생성

아래 구조를 생성한다.

```
ai-spec/
  projects/
    <feature>/
      requirement.md   ← 템플릿으로 생성
      docs/            ← 기획서가 있는 경우에만 생성 (빈 폴더는 .gitkeep 으로 유지)
```

`docs/` 폴더는 기획서 유무에 따라 조건부로 생성한다.

| 기획서 유무 | 처리 |
|------------|------|
| 있음 | `docs/` 폴더 + `docs/.gitkeep` 생성 후 Step 3으로 이동 |
| 없음 | `docs/` 폴더 생성 생략, 바로 Step 4로 이동 |

---

### Step 3 — 기획서 배치 안내 (docs/ 있는 경우만)

`docs/` 폴더 생성 후 **vscode_askQuestions 도구**로 아래 질문을 표시하고 사용자 응답을 기다린다.

```
질문: ai-spec/projects/<feature>/docs/ 폴더가 준비되었습니다.
      기획서(PDF, 이미지, 문서 등)를 위 폴더에 복사한 후 아래에서 선택해주세요.

선택지:
  - 파일 복사 완료       → Step 4 로 이동
  - 나중에 추가할게요    → Step 4 로 이동 (docs 분석 생략)
```

어떤 선택이든 Step 4 로 이동한다.

---

### Step 4 — requirement.md 생성

인터뷰에서 수집한 내용을 바탕으로 `requirement.md` 템플릿을 생성한다.
각 섹션은 `(작성 필요)` 로 채워 템플릿만 생성한다.

#### requirement.md 템플릿

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

`docs/` 폴더가 생성된 경우 "참고 문서" 섹션에 안내 문구를 추가한다.

```markdown
## 참고 문서
<!-- docs/ 폴더에 파일을 넣은 후 spec-todo 스킬로 분석을 요청하세요 -->
(없음)
```

---

### Step 5 — 완료 보고

생성된 파일 구조를 출력하고 다음 단계를 안내한다.

```
spec 프로젝트가 초기화되었습니다.

생성된 파일:
  ai-spec/projects/<feature>/requirement.md
  ai-spec/projects/<feature>/docs/          (기획서 있는 경우)

다음 단계:
requirement.md 를 직접 작성하거나, docs/ 에 기획서 또는 프로젝트와 관련된 엑셀, 이미지 등을 넣고
`spec-todo` 스킬을 사용하여 작업 목록을 자동으로 생성 합니다.
```

---

## 처리 규칙

- `ai-spec/projects/<feature>/` 폴더가 이미 존재하는 경우 덮어쓰지 않고 사용자에게 알린다.
- feature명에 대문자, 공백, 특수문자가 포함된 경우 소문자+하이픈으로 변환하여 제안한다.
- `requirement.md` 첫 줄에는 반드시 spec-development-rules.md 참조 지시문을 포함한다.
