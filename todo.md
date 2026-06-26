# 규칙·스킬 검토 보완 작업

검토에서 발견한 모순·누락·버그를 우선순위대로 처리한다. 각 항목은 "발견된 케이스 → 수정 방향" 형태로 기록한다.

## [T-01] spec_search 구현 추가 (치명적)
- 상태: [x] 완료
- 결과. `mcp-server/index.ts`에 `spec_search`(project-wide `_codebase/` 검색, 선택적 `query` 필터) 구현. `splitSections`·`collectCodebaseFiles` 헬퍼 추가. 구식 테스트 2건을 동작 계약에 맞게 3건으로 정합화. `tsc` 빌드·`npm test`(12/12) 통과.
- 케이스. README 4개 언어판과 `test/index.test.ts`가 `spec_search`(8번째 도구)를 요구하지만 `mcp-server/index.ts`에 구현이 없어 `npm test` 2건 실패.
- 수정 방향.
  - README 설명(SSOT)대로 `ai-spec/_codebase/` 를 읽어 코드 위치·심볼을 반환하는 프로젝트 공용 도구로 구현한다.
  - `query` 지정 시 해당 키워드가 포함된 섹션만 필터링하여 반환한다.
  - `_codebase/` 가 없으면 안내 오류 메시지를 반환한다.
  - 기존 테스트는 존재하지 않는 `feature`/`search.md` 개념에 의존하므로, README 동작 계약에 맞게 테스트 케이스를 정합화한다.
  - 빌드(`tsc`) 후 `npm test` 전체 통과를 검증한다.

## [T-02] requirement.md 기본 템플릿 get_rules 지시문 모순 (rules)
- 상태: [x] 완료
- 결과. `rules/spec-development-rules.md` 기본 템플릿 첫 줄에 get_rules 참조 HTML 주석 지시문을 추가하고, 커스텀 템플릿에도 필수임을 명시.
- 케이스. rules가 "커스텀 템플릿이어도 requirement.md 첫 줄 get_rules 지시문 필수"라 명시하나, 정작 기본 템플릿에 해당 지시문이 없음.
- 수정 방향. 기본 템플릿 첫 줄에 get_rules 참조 지시문을 추가하여 규칙과 일치시킨다.

## [T-03] spec-init Step 번호 참조 깨짐 + requirement.md 이중 생성 (spec-init)
- 상태: [x] 완료
- 결과. Step 2 테이블의 잘못된 "Step 4/5 이동" 참조 제거, Step 3→4→5→6 순차 진행 명시. docs 신규 생성 시에만 Step 5 수행하도록 조건 명확화. requirement.md 생성은 Step 6으로 일원화(Step 2는 존재 확인만, Step 6은 미존재 시에만 생성).
- 케이스. Step 2 테이블이 가리키는 "Step 4/5 이동"이 _codebase·훅 단계 삽입 후 어긋남. docs 없을 때 Step 3(_codebase) 초기화를 건너뛸 위험. 또한 Step 2와 Step 6이 requirement.md를 중복 생성.
- 수정 방향. Step 2의 흐름 참조를 실제 단계(기획서 배치 안내·requirement 생성)로 바로잡고, requirement.md 생성 책임을 Step 6 한 곳으로 일원화한다.

## [T-04] gotchas.md 참조하지만 미생성 (rules / spec-init / README)
- 상태: [x] 완료
- 결과. spec-init Step 3 `_codebase/` 생성 목록에 gotchas.md(빈 템플릿) 추가. README 4개 언어판 폴더 구조에 gotchas.md 라인 추가. 실제 `ai-spec/_codebase/gotchas.md` 생성.
- 케이스. rules·spec-work가 `_codebase/gotchas.md` 참조를 지시하나 spec-init 생성 목록·README 구조·실제 산출물 어디에도 없음.
- 수정 방향. spec-init `_codebase/` 신규 생성 목록에 gotchas.md(빈 템플릿) 추가, README 폴더 구조에 반영. 실제 `ai-spec/_codebase/gotchas.md` 도 생성.

## [T-05] E2E(T-NNE) 생성 규칙 문서화 누락 (rules / spec-todo)
- 상태: [x] 완료
- 결과. rules Step 4에 "E2E 테스트 항목(`T-NNE`)" 서브섹션 추가(형식·생성 기준·실행 순서·예시). spec-todo B-3에 E2E 항목 생성 안내 추가.
- 케이스. spec-work·MCP 파서는 `T-NNE`를 소비하지만 생성 규칙이 rules·spec-todo 어디에도 없음.
- 수정 방향. rules todo 항목 형식과 spec-todo todo 작성 규칙에 E2E 항목(`T-NNE`) 생성 기준을 추가한다.

## [T-06] 코드베이스 Read 훅 .ts 전용 하드코딩 (spec-init / 설정 파일)
- 상태: [x] 완료
- 결과. Read 훅의 `f.endswith('.ts')` 를 23개 소스 확장자 집합(ts/tsx/js/py/java/go/rb/rs/php/cs/kt/swift/cpp/c/h 등)으로 확장. spec-init SKILL.md·`.claude/settings.json`·`.codex/hooks.json` 동기화. JSON 유효성·파이썬 스니펫(.py 입력) 동작 검증.
- 케이스. PreToolUse Read 훅이 `.ts` 확장자만 매칭하여 비-TS 프로젝트에서 동작하지 않음. PostToolUse와 비대칭.
- 수정 방향. 일반적인 소스 확장자 집합으로 확장한다. spec-init SKILL.md 훅 JSON, `.claude/settings.json`, `.codex/hooks.json` 동기화.

## [T-07] README 자체 모순 "four tools" (README ko/en/ja/zh)
- 상태: [x] 완료
- 결과. 4개 언어판 verify 문구를 "네 개 도구"→"여덟 개 도구"로 정정하고 8개 도구 전체를 나열.
- 케이스. verify 섹션은 "네 개 도구"라 하지만 표에는 8개 도구가 있음.
- 수정 방향. 현재 도구 개수와 목록에 맞게 문구를 정정한다.

## [T-08] 생성된 index.md 깨진 링크/누락 섹션 (ai-spec/_codebase 산출물)
- 상태: [x] 완료
- 결과. 누락된 modules/cli.md·rules.md 신규 작성(깨진 링크 해소). index.md에 "모듈 의존 관계"·"주요 실행 흐름" 섹션 추가. mcp-server.md의 미존재 함수(extractFilePaths/findStalePaths) 제거·옛 spec_search 설명 정정·라인 번호 제거. last-synced.md 현재 git hash로 갱신.
- 케이스. index.md가 존재하지 않는 modules/cli.md·rules.md를 링크. rules 포맷이 요구하는 "모듈 의존 관계"·"주요 실행 흐름" 테이블 누락.
- 수정 방향. 누락 모듈 문서 생성 또는 링크 정정, 누락 섹션 보강. (산출물 정비, 최저 우선순위)
