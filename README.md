# express-admin-api-template-2

## 개발 및 빌드

Node.js 24를 사용한다. 번들러는 Rspack이며 `rspack.config.js`에서 설정한다.

```shell
npm install
npm run dev
```

`dev:hot`은 Rspack으로 서버를 빌드하고 코드 변경을 HMR로 반영한다.
저장과 format-on-save의 연속 변경을 묶기 위해 마지막 변경 후 1초 동안 기다린 뒤 다시 빌드한다.
변경 간격이 1초를 넘으면 별도 빌드로 처리하며, 이 대기 시간은 최초 빌드나 `.env` 재시작에는 적용하지 않는다.
HMR로 처리할 수 없는 변경은 서버를 재시작하며, `.env` 변경도 재시작한다.
`dev:lint`는 별도 프로세스로 ESLint를 실행한다.
파일 감시가 제한된 환경에서는 `WATCHPACK_POLLING=500 npm run dev:hot`으로 polling 감시를 사용할 수 있다.

```shell
npm run verify
npm run build:rspack
node dist/app.js
```

`build:rspack`은 타입 검사와 ESLint 검사 후 프로덕션 번들을 `dist/app.js`에 생성한다.
기존처럼 Express, Knex, MySQL은 외부 모듈로 유지하므로 실행 서버에도 프로덕션 의존성을 설치해야 한다.
`npm run build`는 테스트와 Rspack 빌드에 더해 Watchman 상태와 `dist`를 초기화한다.

## 배포 준비
- .gitignore 파일에서 /dist 주석 처리
```
# production (배포 시 주석 처리)
/dist --> 이 부분 주석 처리
```

- .gitignore 적용
```shell
npm run reset:gitignore
```

- 빌드 실행
```shell
npm run build
```

- Production 배포 브랜치 생성
```shell
npm run make:publish:production
```

- Development 배포 브랜치 생성 (선택)
```shell
npm run make:publish:development
```

- Staging 브랜치 생성 (선택)
```shell
npm run make:publish:staging
```

## 배포 서버 설정 (yum 기반 서버)
```shell
# YUM 업데이트
yum update

# 한국 시간으로 변경
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# git 설치
yum install -y git

# NVM 설치 (Node.js 24를 지원하는 OS 필요)
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash && source /root/.bashrc && nvm install 24

# REDIS 설치 (선택)
# AWS EC2 에 설치시에는 https://dangdangee.tistory.com/entry/Redis-ec2%EC%97%90-%EB%A0%88%EB%94%94%EC%8A%A4-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0 참고
yum install -y epel-release && yum install -y redis && systemctl start redis && systemctl enable redis 

# PM2 설치
npm i -g pm2 && pm2 startup && systemctl start pm2-root && systemctl enable pm2-root

# AWS EC2 프리티어 사용 시 swap 메모리 설정 (선택)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
# 재부팅시에도 실행되도록 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
# swap 메모리 확인
free -h

# github 에 등록 할 SSH-KEY 생성 (생성 후 github 에 등록)
ssh-keygen -t ecdsa -b 521 && cat /root/.ssh/id_ecdsa.pub

# 프로젝트 클론
git clone [git주소]
cd [폴더명]

# 배포 브랜치로 변경
git checkout publish/[production/development/staging]

# 실행용 모듈 설치
npm run install:prod

# .env 파일 생성
vi .env

# 서비스 실행
npm run pm2:start

# pm2 저장
pm2 save
```

## 배포
```shell
# 빌드
npm run build

# build 된 파일 저장 후 배포 실행
npm run publish:[production/development/staging]
```
