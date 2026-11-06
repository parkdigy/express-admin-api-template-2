# 저장소 에이전트 안내

## 구조와 변경 경계

- Node.js 24 (`.nvmrc`), Express 5, TypeScript, Rspack/SWC 기반 API 서버다. `src/app.ts`의 첫 `import './init'`이 전역 함수와 타입을 등록하므로 순서를 유지한다.
- 요청은 `src/routes` → `src/controllers` → `src/db/mysql/query`를 따른다. 라우트별 `Controller`, `ApiController`와 인증·업로드 미들웨어의 순서를 확인한다.
- 컨트롤러 래퍼는 자동 트랜잭션을 만들지 않는다. 원자성이 필요하면 `await db.trans(...)` 안의 작업을 모두 await하고 롤백할 오류를 콜백 밖으로 전파한다.
- DB는 `@pdg/drizzle-mysql`을 사용한다. 스키마·쿼리 변경 시 `src/db/mysql/schema`, `src/db/mysql/query`, `src/db/db.ts`와 관련 export를 확인한다. 환경변수 변경 시 `.env.example`과 `src/@types/process.d.ts`도 확인한다.
- `dist`, `@dev`, `@logs`를 직접 편집하지 않는다. 두 계층 이상을 함께 바꾸거나 트랜잭션·스케줄러를 다룰 때는 `.agents/skills/express-api-template-2-orchestrator/SKILL.md`를 사용한다.

## 검증과 안전

- 기본 검증은 `npm run verify`다. 타입 검사, ESLint, Jest가 순차 실행되며 앞 단계가 실패하면 뒤 단계는 실행되지 않는다.
- `npm run dev`는 HMR, ESLint, 별도 `tsc --noEmit` 감시를 실행한다. SWC는 타입을 검사하지 않고 `skipLibCheck`는 의존성 선언 파일 검사를 건너뛴다.
- 별칭·번들·진입점 변경 시 `npm run build:rspack`도 확인한다. 이 명령은 타입·lint 검사 후 `dist`에 출력하므로 기존 산출물 영향을 먼저 확인한다.
- Jest/Watchman 접근 오류가 있으면 `npm test -- --runInBand --watchman=false`로 별도 확인하고 기본 검증 결과와 구분한다. 외부 DB·서비스 연동 검증 여부를 명시한다.
- `npm run build`는 `dist`와 Watchman 상태를 변경한다. `make:publish:*`, `publish:*`, `reset:gitignore`, PM2 명령은 명시적 요청 없이 실행하지 않는다.
