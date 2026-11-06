/********************************************************************************************************************
 * 라우터 처리 종료 미들웨어
 * - 라우터 처리가 완료되면 호출되는 미들웨어
 * - env.$$routerCount 감소
 * - finisher 로그 출력
 * ******************************************************************************************************************/

export default async function (req: MyRequest) {
  env.$$routerCount = (env.$$routerCount || 0) - 1;
  ll('finisher', req.method, `${req.baseUrl}${req.path}`, env.$$routerCount);
}
