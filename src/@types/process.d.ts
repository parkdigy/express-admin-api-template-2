type EnvBoolean = 'true' | 'false' | '';

declare namespace NodeJS {
  interface ProcessEnv {
    // 프로젝트명 (영문자/하이픈/언더바 만 사용, 기타 특수문자 및 공백 사용 불가)
    PROJECT_NAME: string;
    // 앱명
    APP_NAME: string;
    // 환경 (local, development, staging, production)
    APP_ENV: 'local' | 'development' | 'staging' | 'production';
    // 암호화 키
    APP_KEY: string;
    // 실행 호스트
    APP_HOST: string;
    // 실행 포트
    APP_PORT: string;
    // 클라이언트와 연결 유지 여부
    APP_KEEP_ALIVE: EnvBoolean;
    // 클라이언트와 연결 유지 시간 (초)
    APP_KEEP_ALIVE_TIMEOUT_SECONDS: string;
    // HTTPS 사용 여부
    APP_SECURE: EnvBoolean;
    // HTTPS 포트
    APP_SECURE_PORT: string;
    // HTTPS 인증서 key.pem 파일 경로
    APP_SECURE_KEY_PATH: string;
    // HTTPS 인증서 cert.pem 파일 경로
    APP_SECURE_CERT_PATH: string;

    // PM2 Reload
    PM2_RELOAD: string;
    PM2_RELOAD_HOUR: string;
    PM2_RELOAD_MINUTE: string;

    // API 시작/종료 로그 표시 여부
    API_START_FINISH_LOG_SHOW: EnvBoolean;

    // 접속 로그 기록 여부
    LOGGING: EnvBoolean;

    // JWT 토큰 쿠키명 (지정하지 않으면 `_${PROJECT_NAME}_ajt_` 사용)
    AUTH_JWT_TOKEN_COOKIE_NAME: string;
    // JWT 토큰 만료 기간 (일) (-1 = 제한없음)
    AUTH_JWT_TOKEN_EXPIRES_DAYS: string;

    // 데이터베이스 (mysql, mssql, sqlite, postgresql, ...)
    DB_CONNECTION: string;
    // 데이터베이스 호스트
    DB_HOST: string;
    // 데이터베이스 포트
    DB_PORT: string;
    // 데이터베이스명
    DB_DATABASE: string;
    // 데이터베이스 로그인 사용자명
    DB_USERNAME: string;
    // 데이터베이스 로그인 암호
    DB_PASSWORD: string;

    // 메일 서버 호스트
    MAIL_HOST: string;
    // 메일 서버 포트
    MAIL_PORT: string;
    // 메일 서버 보안 사용 여부
    MAIL_SECURE: EnvBoolean;
    // 메일 서버 로그인 사용자명
    MAIL_USERNAME: string;
    // 메일 서버 로그인 암호
    MAIL_PASSWORD: string;
    // 메일 발신자 이메일
    MAIL_FROM_EMAIL: string;
    // 메일 발신자 표시 이름
    MAIL_FROM_NAME: string;

    // 세션 드라이버 (file, database, redis, ...)
    SESSION_DRIVER: string;
    // 세션 만료 시간 (초)
    SESSION_EXPIRES_IN_SEC: string;

    // 세션 Redis 호스트 (세션 드라이버가 redis 인 경우)
    SESSION_REDIS_HOST: string;
    // 세션 Redis 포트 (세션 드라이버가 redis 인 경우)
    SESSION_REDIS_PORT: string;
    // 세션 Redis 암호 (세션 드라이버가 redis 인 경우)
    SESSION_REDIS_PASSWORD: string;

    // S3 (Public Bucket) Key
    S3_KEY: string;
    // S3 (Public Bucket) Secret
    S3_SECRET: string;
    // S3 (Public Bucket) Region
    S3_REGION: string;
    // S3 (Public Bucket) 버킷명
    S3_BUCKET: string;
    // S3 (Public Bucket) 치환할 URL (https://{S3_BUCKET}.s3.amazonaws.com/... -> {S3_REPLACE_URL}/...)
    S3_REPLACE_URL: string;
    // S3 (Public Bucket) 기본 경로
    S3_PATH: string;

    // S3 (Private Bucket) Key
    S3_PRIVATE_KEY: string;
    // S3 (Private Bucket) Secret
    S3_PRIVATE_SECRET: string;
    // S3 (Private Bucket) Region
    S3_PRIVATE_REGION: string;
    // S3 (Private Bucket) 버킷명
    S3_PRIVATE_BUCKET: string;
    // S3 (Private Bucket) 기본 경로
    S3_PRIVATE_PATH: string;

    // 슬랙 웹훅 URL (서버 시작 시 알림)
    SLACK_WEB_HOOK_URL: string;
    // 슬랙 (알림) 웹훅 URL
    SLACK_ALARM_WEB_HOOK_URL: string;
    // 슬랙 (관리자 알림) 웹훅 URL
    SLACK_ADMIN_ALARM_WEB_HOOK_URL: string;

    // GitHub Actions 배포 암호
    DEPLOY_GITHUB_SECRET: string;
    // GitHub Actions 배포 브랜치
    DEPLOY_GITHUB_REF: string;
  }
}
