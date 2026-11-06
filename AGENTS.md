# 저장소 에이전트 안내

## 핵심 구조

- Node.js 24 (`.nvmrc`), Express 5, TypeScript, Rspack/SWC 기반 API 서버다. 진입점은 `src/app.ts`이며 `routes → controllers → db/mysql/query` 순서로 요청을 처리한다.
- `src/app.ts`의 첫 `import './init'`은 전역 타입·함수(`db`, `env`, `param`, `util`, `ll` 등)를 등록하므로 순서를 보존한다.
- 라우트는 `Controller(...)` 래퍼를 사용한다. 이 래퍼는 오류를 로깅하고 응답하지만 자동 트랜잭션을 만들지 않는다. 원자성이 필요하면 `db.trans` 범위 안에서 작업을 await하고 실패를 콜백 밖으로 전파한다.
- DB는 `@pdg/drizzle-mysql`을 사용한다. 스키마·쿼리 변경 시 `src/db/mysql/schema`, `src/db/mysql/query`, `src/db/db.ts`와 관련 `index.ts` export를 확인한다. 환경변수 이름은 `.env.example`과 타입 선언에도 반영한다.
- `dist`, `@dev`, `@logs`는 직접 편집하지 않는다.

## 검증과 안전

- 기본 검증: `npm run verify`
- `npm run dev`는 Rspack HMR, ESLint, 별도 `tsc --noEmit` 감시를 병렬 실행한다. SWC 자체는 타입을 검사하지 않는다. `tsconfig.json`의 `skipLibCheck`는 의존성 선언 파일 검사를 건너뛴다.
- 별칭·번들·진입점 변경: 추가로 `npm run build:rspack`
- Jest/Watchman 접근 오류가 있으면 `npm test -- --runInBand --watchman=false`로 별도 확인하고 기본 검증 결과와 구분한다. 외부 DB·서비스 연동 검증 여부를 명시한다.
- `npm run build`는 `dist`와 Watchman 상태를 변경한다. `make:publish:*`, `publish:*`, `reset:gitignore`, PM2 명령은 명시적 요청 없이 실행하지 않는다.

두 계층 이상을 함께 바꾸거나 트랜잭션·스케줄러를 다룰 때는 `.agents/skills/express-api-template-2-orchestrator/SKILL.md`를 사용한다.
