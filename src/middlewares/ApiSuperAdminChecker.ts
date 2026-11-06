/********************************************************************************************************************
 * Super Admin 권한 검사 미들웨어
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default async function (req: MyRequest, res: MyResponse, next: NextFunction) {
  if (req.$$user && req.$$user.is_super_admin) {
    next();
  } else {
    api.error(res, api.Error.Permission);
  }
}
