# 런타임과 운영 경계

## 서버 수명주기

- `src/app.ts`는 가장 먼저 `src/init`을 불러 전역 런타임 값과 타입을 등록한다.
- 보안 헤더, body/cookie parser, 조건부 Redis session, 라우트, HTTP(S) 서버를 구성한다. `/deploy/github`의 서명 검증을 위해 JSON 원문을 보존한다.
- 서버 listen 후 scheduler를 시작하고 PM2에 `ready` 신호를 보낸다. 현재 등록 라우트는 `src/routes/index.ts`를 확인한다.
- SIGINT 처리와 HMR 재시작은 서버 및 스케줄러 수명주기에 영향을 주므로 관련 변경 시 함께 검토한다.

## 공통 모듈과 전역

- 공통 모듈은 명시적 import/export를 우선하고 관련 `index.ts`를 맞춘다.
- 전역 추가가 꼭 필요하면 `src/init`의 런타임 할당과 `declare global` 타입을 함께 변경한다.
- 프로토타입 확장에는 관련 런타임 회귀 테스트를 추가한다.

## 스케줄러

- `JobBase` 구현은 안정적인 `getId()`를 제공하고 `src/scheduler/Jobs/index.ts`와 `src/scheduler/scheduler.ts`의 등록부를 함께 갱신한다.
- `handler()`는 실제 비동기 완료까지 await해야 한다. 조기 반환은 중복 실행 방지를 일찍 해제한다. 기존 `AppReloadJob`의 `exec`는 완료를 기다리지 않는 점에 유의한다.
- 중복 실행 방지는 프로세스별 메모리 상태이며 여러 프로세스 간 잠금이 아니다. `$$run()`은 handler 오류를 잡고 재전파하지 않는다.
- 외부 호출과 DB 변경이 섞이면 부분 성공 후 재시도의 중복 부작용을 검토한다.

## 개발과 검증

- `npm run dev`는 `dev:hot`, `dev:lint`, `dev:types`를 병렬 실행한다. SWC는 타입 검사를 수행하지 않으며 `dev:types`가 별도로 검사한다.
- `dev:hot`은 `@dev`를 정리하고 Rspack HMR 서버를 실행한다. `.env` 변경 또는 수락되지 않은 HMR 변경은 서버 재시작을 유발한다.
- `npm run verify`는 타입 검사, ESLint, Jest를 순차 실행하며 실패 시 중단한다. `skipLibCheck`가 활성화되어 라이브러리 선언 파일 자체는 검사하지 않는다.
- Rspack 별칭은 `tsconfig.json`의 paths에서 생성되고 Jest도 같은 paths를 매핑한다. 별칭 변경 시 실제 대상과 번들을 확인한다. `npm run build:rspack`은 `dist`에 출력한다.

## 배포

- `/deploy/github`는 원문 본문의 HMAC 서명, push 이벤트와 ref를 확인한 뒤 Git 명령을 실행하며 조건에 따라 설치와 PM2 reload를 실행한다. 테스트 시 명령 실행을 격리한다.
- `npm run build`는 Watchman 상태와 `dist`를 변경한다.
- 배포 브랜치 스크립트는 checkout, merge, push, Git index 변경을 포함하므로 일반 검증에 사용하지 않는다.
