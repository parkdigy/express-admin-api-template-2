/********************************************************************************************************************
 * 로컬 환경인지 검사하는 미들웨어
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default function (req: MyRequest, res: MyResponse, next: NextFunction) {
  if (env.isLocal) {
    next();
  } else {
    res.send(404);
  }
}
