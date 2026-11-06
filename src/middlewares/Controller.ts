/********************************************************************************************************************
 * 기본 Controller 미들웨어
 * - 세션 인증 검사 실행 (선택)
 * - Starter 실행
 * - 오류를 기록하고 표준 오류 응답 반환
 * - Transaction은 db.trans(callback)에서 관리
 * - Finisher 실행
 * ******************************************************************************************************************/

import Starter from './Starter';
import Finisher from './Finisher';
import SessionAuthChecker from './JwtCookieAuthChecker';
import { type MyAuthController, type MyController } from '@types';
import { type NextFunction, type RequestHandler } from 'express';

export default function (
  controller: MyController | MyAuthController,
  sessionAuthCheck = false,
  afterStartMiddlewares: RequestHandler[] = [],
  beforeFinishMiddlewares: RequestHandler[] = []
) {
  const result = [
    Starter,
    ...afterStartMiddlewares,
    async (req: MyRequest | MyAuthRequest, res: MyResponse, next: NextFunction) => {
      try {
        await controller(req as any, res);
      } catch (err) {
        printError(req, err);

        if (!res.headersSent) {
          res.status(500).send({
            result: {
              c: -1,
              m: '요청 처리 중 오류가 발생했습니다.',
            },
          });
        }
      }

      next();
    },
    ...beforeFinishMiddlewares,
    Finisher,
  ];

  if (sessionAuthCheck) {
    result.unshift(SessionAuthChecker);
  }

  return result;
}
