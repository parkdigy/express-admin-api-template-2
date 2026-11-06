/********************************************************************************************************************
 * API 호출 권한 검사 미들웨어
 * - post, patch, delete 메소드 호출 시 사용
 * - /my//permission 통해서 등록 후 5초 동안 허용
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default function (req: MyRequest, res: MyResponse, next: NextFunction) {
  try {
    const { $$apiCallPermissionTime } = req.session;

    if ($$apiCallPermissionTime) {
      if (now().getTime() - $$apiCallPermissionTime < 5000) {
        req.session.$$apiCallPermissionTime = undefined;
        next();
      } else {
        api.error(res, api.Error.Permission);
      }
    } else {
      api.error(res, api.Error.Permission);
    }
  } catch {
    api.error(res, api.Error.Permission);
  }
}
