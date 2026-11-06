/********************************************************************************************************************
 * 라우터 처리 시작 미들웨어
 * - env.$$routerCount 증가
 * - starter 로그 출력
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default async function (req: MyRequest, res: MyResponse, next: NextFunction) {
  env.$$routerCount = (env.$$routerCount || 0) + 1;

  if (process.env.API_START_FINISH_LOG_SHOW === 'true') {
    const url = `${req.baseUrl}${req.path}`;
    if (url !== '/ping/') {
      ll('starter', req.method, url, env.$$routerCount);
    }
  }

  next();
}
