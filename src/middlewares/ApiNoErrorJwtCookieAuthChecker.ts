/********************************************************************************************************************
 * API 세션 로그인 여부 검사 미들웨어
 * - JWT 토큰을 쿠키에서 검사하여 로그인 여부 확인
 * - 로그인 여부에 따라 req.$$user 에 사용자 정보 저장
 * - 로그인 여부에 따라 새로운 JWT 토큰을 재발급
 * - 로그인 실패 시, 쿠키에서 JWT 토큰을 삭제
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default async function (req: MyRequest, res: MyResponse, next: NextFunction) {
  try {
    const { userId } = jwt.verifyAccessToken(req);
    if (userId) {
      req.$$user = await db.q.user.infoForSession(userId);
      if (req.$$user == null) {
        jwt.clearAccessToken(res);
      }
    } else {
      jwt.clearAccessToken(res);
    }
  } catch {
    jwt.clearAccessToken(res);
  }

  next();
}
