---
name: spec-init
description: "Spec-Driven Development를 위한 프로젝트 초기화 스킬. ai-spec/projects 폴더 하위에 feature 폴더와 requirement.md 등 기본 파일을 생성한다. 기획서(PDF, 이미지 등)가 있는 경우 docs/ 폴더 준비 및 안내를 포함한다. docs/ 폴더에 문서가 추가된 경우 문서를 분석하여 requirement.md 초안을 작성한다. spec 초기화, spec 생성, 새 기능 시작, requirement 작성, 기획서 분석, docs 분석 요청 시 사용한다."
argument-hint: "feature 폴더명 (예: seller-dashboard, order-management). 생략 시 AI가 요구사항을 먼저 인터뷰한다."
---

# Spec 프로젝트 초기화 스킬

## 개요

`ai-spec/projects/<feature>/` 폴더를 생성하고 Spec-Driven Development에 필요한 기본 파일 구조를 셋업한다.
기획서(PDF, 이미지 등)가 있는 경우 `docs/` 폴더를 준비하고 사용자가 파일을 직접 넣을 수 있도록 안내한다.

## When to Use

**A. 초기화** (Procedure A)
- 새로운 기능 개발을 spec 기반으로 시작할 때
- `ai-spec/projects/<feature>/` 폴더와 `requirement.md` 를 처음 만들 때
- 기획서나 참고 문서를 `docs/` 에 등록하고 싶을 때

**B. 기획서 분석** (Procedure B)
- `docs/` 폴더에 기획서(PDF, 이미지 등)를 추가한 후 요구사항 초안을 작성하고 싶을 때
- 기존 requirement.md 가 비어있거나 템플릿 상태일 때 문서를 기반으로 내용을 채우고 싶을 때
- 기획서가 업데이트되어 requirement.md 를 재검토하고 싶을 때

트리거 문장 예시
```
docs 분석해서 requirement 작성해줘
기획서 보고 요구사항 뽑아줘
docs 업데이트됐어
```

---

## Procedure A — 신규 프로젝트 초기화

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
      requirement.md   ← 내용 포함하여 생성
      docs/            ← 기획서가 있는 경우에만 생성 (빈 폴더는 .gitkeep 으로 유지)
```

`docs/` 폴더는 기획서 유무에 따라 조건부로 생성한다.

| 기획서 유무 | 처리 |
|------------|------|
| 있음 | `docs/` 폴더 + `docs/.gitkeep` 생성 후 Step 3으로 이동 |
| 없음 | `docs/` 폴더 생성 생략, 바로 Step 4로 이동 |

---

### Step 3 — 기획서 배치 안내 (docs/ 있는 경우만)

`docs/` 폴더 생성 후 다음 메시지를 출력하고 **사용자 확인을 기다린다.**

```
docs/ 폴더가 준비되었습니다.

  📁 ai-spec/projects/<feature>/docs/

기획서(PDF, 이미지, 문서 등)를 위 폴더에 직접 복사해주세요.
파일을 넣은 후 "완료" 또는 "docs 준비됐어" 라고 입력해주세요.

파일이 아직 없거나 나중에 추가할 경우 "없음" 또는 "건너뛰기" 를 입력해주세요.
```

사용자가 확인 메시지를 입력하면 `docs/` 폴더의 파일 목록을 확인한다.

```
파일 확인 결과를 requirement.md 의 "참고 문서" 섹션에 기록합니다.
```

---

### Step 4 — requirement.md 생성

인터뷰에서 수집한 내용을 바탕으로 `requirement.md` 를 생성한다.
사용자가 상세 내용을 채팅으로 전달한 경우 해당 내용을 반영한다.
전달된 내용이 없는 경우 각 섹션을 `(작성 필요)` 로 채워 템플릿만 생성한다.

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

`docs/` 폴더에 파일이 확인된 경우 "참고 문서" 섹션에 파일명을 목록으로 기재한다.

```markdown
## 참고 문서
- docs/기획서_v1.pdf
- docs/화면설계서.png
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
1. requirement.md 를 열어 요구사항을 작성해주세요.
2. 작성이 완료되면 아래 명령으로 개발을 시작하세요.

   "ai-spec/projects/<feature>/requirement.md 파일의 요구사항을 확인해서 개발 진행해줘"
```

---

## Procedure B — docs 분석 후 requirement.md 작성

사용자가 `docs/` 폴더에 문서를 추가한 후 요구사항 작성을 요청한 경우 이 절차를 따른다.

### B-1 — feature 폴더 확인

사용자가 feature명을 명시하지 않은 경우 묻는다.

```
어떤 feature 의 docs 를 분석할까요?
예) ai-spec/projects/seller-dashboard/docs/
```

`ai-spec/projects/<feature>/docs/` 폴더의 파일 목록을 확인한다.
파일이 없으면 사용자에게 알리고 종료한다.

### B-2 — 문서 분석

`docs/` 폴더의 각 파일을 분석한다.

| 파일 유형 | 처리 방법 |
|----------|-----------|
| 이미지 (.png, .jpg, .gif 등) | view_image 도구로 내용 분석 |
| PDF | 텍스트 추출 가능한 경우 읽기, 불가능한 경우 사용자에게 텍스트 내용 요약 요청 |
| 마크다운 / 텍스트 | read_file 도구로 직접 읽기 |

분석 시 다음 항목을 추출한다.

- 기능 목표 및 배경
- 화면 구성 및 UI 흐름
- 주요 기능 목록
- 예외 케이스 및 제약 조건
- 승인 기준으로 변환 가능한 항목

### B-3 — requirement.md 초안 작성

분석 결과를 바탕으로 requirement.md 초안을 작성한다.

**기존 requirement.md 가 있는 경우:**
- 현재 내용을 먼저 읽는다.
- 빈 섹션(`(작성 필요)`)만 채운다.
- 이미 작성된 내용은 덮어쓰지 않고 충돌 시 사용자에게 보고한다.

```
[기존 내용과 충돌 발견]
- 섹션: 기능 목표
- 기존 내용: ...
- 기획서 분석 내용: ...

어떤 내용으로 업데이트할까요? 기존 유지 / 기획서 기준으로 업데이트
```

**requirement.md 가 없거나 템플릿 상태인 경우:**
- Procedure A 의 템플릿을 기반으로 내용을 채워 새로 생성한다.

### B-4 — 작성 내용 확인 요청

requirement.md 에 반영하기 전에 **분석한 내용을 채팅에 요약 출력**하고 확인을 받는다.

```
기획서 분석 결과를 요약합니다.

[기능 목표]
...

[주요 기능]
...

[Acceptance Criteria 후보]
- [ ] ...

위 내용으로 requirement.md 를 작성할까요?
  확인   → requirement.md 에 반영합니다
  수정   → 수정할 내용을 알려주세요
```

사용자가 `확인` 또는 `진행해` 를 입력하면 requirement.md 를 작성한다.

### B-5 — 완료 보고

```
requirement.md 작성이 완료되었습니다.

다음 단계:
요구사항을 검토한 후 개발을 시작하세요.

  "ai-spec/projects/<feature>/requirement.md 파일의 요구사항을 확인해서 개발 진행해줘"
```

---

## 처리 규칙

- `ai-spec/projects/<feature>/` 폴더가 이미 존재하는 경우 덮어쓰지 않고 사용자에게 알린다.
- feature명에 대문자, 공백, 특수문자가 포함된 경우 소문자+하이픈으로 변환하여 제안한다.
- `requirement.md` 첫 줄에는 반드시 spec-development-rules.md 참조 지시문을 포함한다.
- `docs/` 폴더만 생성하고 파일이 없는 경우 `.gitkeep` 을 생성하여 폴더가 git에 추적되도록 한다.
