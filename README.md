# DEV AI KIT

AI 에이전트에 사용될 공통 Skills, 개발 규칙, 프롬프트를 관리하는 중앙 저장소입니다.

## 사용 방법

### 1. 대상 프로젝트에서 해당 리포 추가

```bash
pnpm add -D git+https://github.com/playauto/dev-ai-kit.git
```

### 2. 대상 프로젝트의 package.json에 스크립트 추가

```json
{
  "scripts": {
    "sync:skills": "node node_modules/dev-ai-kit/scripts/sync-skills.js"
  }
}
```