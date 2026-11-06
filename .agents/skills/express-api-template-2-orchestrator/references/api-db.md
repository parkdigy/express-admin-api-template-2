# API와 DB 계약

## 요청 흐름

- `src/routes`는 URI, HTTP method, 인증·업로드 미들웨어를 정하고 `Controller(...)`로 controller를 연결한다.
- `Controller`는 선택적 JWT 쿠키 인증, `Starter`, controller, 추가 미들웨어, `Finisher`를 순서대로 실행한다. controller 오류는 `printError`로 기록하고 헤더가 전송되지 않았다면 일반화된 500 응답을 보낸다.
- `Controller`는 트랜잭션을 자동으로 시작하거나 commit/rollback하지 않는다. 주석이나 과거 테스트의 mock만으로 실제 동작을 판단하지 않는다.
- 입력은 `src/common/param` 프리셋을 우선 사용하고, controller 추가 시 폴더와 상위 `index.ts` export를 확인한다.

## DB 확장

1. `src/db/mysql/schema/<Domain>`에 `@pdg/drizzle-mysql`의 스키마를 정의하고 상위 스키마 export에 연결한다.
2. `src/db/mysql/query/<Domain>`에 쿼리 클래스를 구현하고 query export를 연결한다. 공통 `MySqlQuery`는 `mysql.current`를 사용한다.
3. `src/db/db.ts`의 공개 `db.q` 및 연결 구성을 확인한다. 필요한 환경변수는 `.env.example`과 `src/@types/process.d.ts`를 함께 확인한다.
4. 실제 DB 제약과 컬럼 정책, 기존 데이터·마이그레이션 영향을 확인한다. 현재 별도 마이그레이션 절차가 구현되어 있다고 가정하지 않는다.

원자성이 필요한 작업은 명시적으로 `await db.trans(async () => { ... })`를 사용한다. 쿼리 객체는 비동기 문맥의 트랜잭션을 사용하며 중첩 `trans`는 savepoint다. 콜백 안의 비동기 작업을 모두 await하고, rollback이 필요하면 오류가 콜백 밖으로 전파되게 한다. 원본 Drizzle이나 raw SQL 사용 시 래퍼의 컬럼·조건 보호가 적용되는지 확인한다. 세부 API는 설치된 `@pdg/drizzle-mysql` 문서와 타입을 확인한다.

## 완료 확인

- URI·method와 인증 미들웨어가 요구사항과 일치하는가?
- 스키마, 쿼리, `db.q`, export가 동기화됐는가?
- 성공, 입력 오류, 인증 실패, DB 실패와 필요한 rollback 경로를 확인했는가?
- 외부 호출 성공 후 DB 실패와 재시도 부작용을 검토했는가?
