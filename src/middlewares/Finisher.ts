/********************************************************************************************************************
 * 라우터 처리 종료 미들웨어
 * - 라우터 처리가 완료되면 호출되는 미들웨어
 * - env.$$routerCount 감소
 * - finisher 로그 출력
 * ******************************************************************************************************************/

export default async function (req: MyRequest) {
  env.$$routerCount = (env.$$routerCount || 0) - 1;

  if (process.env.API_START_FINISH_LOG_SHOW === 'true') {
    const url = `${req.baseUrl}${req.path}`;
    if (url !== '/ping/') {
      ll('finisher', req.method, url, env.$$routerCount);
    }
  }
}
