# API와 DB 계약

## 요청 흐름

- `src/routes/index.ts`는 `/deploy`, `/ping`, `/auth`를 등록한다. 각 라우트에서 사용하는 래퍼와 인증·업로드 미들웨어의 실제 순서를 확인한다.
- `Controller`는 선택적 JWT 쿠키 인증 후 `Starter`, 추가 미들웨어, controller, 추가 미들웨어, `Finisher` 순서다. controller 오류를 기록하고 헤더 미전송 시 500 응답을 보낸다.
- `ApiController`는 선택적 로깅 후 같은 시작·종료 구조를 사용하고 오류를 `api.error`로 처리한다. 인증은 라우트나 별도 조합 래퍼에서 적용하므로 자동 인증을 가정하지 않는다. 업로드 조합은 Multer와 인증의 순서도 확인한다.
- 두 래퍼 모두 자동 트랜잭션을 시작하지 않는다. 파일 상단의 오래된 commit/rollback 주석보다 구현을 따른다.
- 입력은 `src/common/param` 프리셋을 우선 사용하고 controller 추가 시 폴더와 상위 `index.ts` export를 확인한다.

## DB 확장

1. `src/db/mysql/schema/<Domain>`에 스키마를 정의하고 상위 스키마 export에 연결한다.
2. `src/db/mysql/query/<Domain>`에 쿼리 클래스를 구현하고 query export를 연결한다. 공통 `MySqlQuery`는 `mysql.current`를 사용한다.
3. `src/db/db.ts`의 공개 `db.q`와 연결 구성을 확인한다. 환경변수는 `.env.example`과 `src/@types/process.d.ts`도 함께 확인한다.
4. 실제 DB 제약과 컬럼 정책, 기존 데이터·마이그레이션 영향을 확인한다. 별도 마이그레이션 절차가 이미 있다고 가정하지 않는다.

원자성이 필요한 작업은 명시적으로 `await db.trans(async () => { ... })`를 사용한다. 콜백 안의 비동기 작업을 모두 await하고 롤백할 오류를 콜백 밖으로 전파한다. 중첩 트랜잭션과 raw SQL의 동작 및 컬럼·조건 보호 범위는 설치된 `@pdg/drizzle-mysql`의 문서와 타입을 확인한다.

## 완료 확인

- URI·method와 인증·업로드 미들웨어 순서가 요구사항과 일치하는가?
- 스키마, 쿼리, `db.q`, export와 환경변수가 동기화됐는가?
- 성공, 입력 오류, 인증 실패, DB 실패와 필요한 rollback 경로를 확인했는가?
- 외부 호출 성공 후 DB 실패와 재시도 부작용을 검토했는가?
