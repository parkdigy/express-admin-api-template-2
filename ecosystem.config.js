module.exports = {
  apps: [
    {
      name: 'express-template-2',
      script: './dist/app.js',
      instances: 1,
      exec_mode: 'cluster',
      wait_ready: true, // ready 이벤트 수신 대기
      listen_timeout: 1000 * 60, // ready 이벤트 수신 대기 시간 (1분)
      kill_timeout: 5000, // SIGINT ↔ SIGKILL 대기시간 (5초)
    },
  ],
};
