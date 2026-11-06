/********************************************************************************************************************
 * 기본 API Controller 미들웨어
 * - 로깅 기록 (선택)
 * - Starter 실행
 * - 오류가 없으면, Transaction Commit 실행
 * - 오류가 있으면, Transaction Rollback 실행
 * - Finisher 실행
 * ******************************************************************************************************************/

import Starter from './Starter';
import Finisher from './Finisher';
import Logger from './Logger';
import ApiCallPermissionChecker from './ApiCallPermissionChecker';
import { type MyAuthController, type MyController } from '@types';
import { type NextFunction, type RequestHandler } from 'express';

export default function (
  controller: MyController | MyAuthController,
  callPermissionCheck = false,
  logging = true,
  loggingData = false,
  afterStartMiddlewares: RequestHandler[] = [],
  beforeFinishMiddlewares: RequestHandler[] = []
) {
  const handlers: any[] = [
    Starter,
    ...afterStartMiddlewares,
    async (req: MyRequest | MyAuthRequest, res: MyResponse, next: NextFunction) => {
      const handleException = async (err: Error) => {
        printError(req, err);

        api.error(res, err);
      };

      try {
        await controller(req as any, res);
      } catch (err) {
        ll(err);
        await handleException(err as Error);
      }

      next();
    },
    ...beforeFinishMiddlewares,
    Finisher,
  ];

  if (logging) {
    handlers.unshift(Logger(loggingData));
  }

  if (callPermissionCheck) {
    handlers.unshift(ApiCallPermissionChecker);
  }

  return handlers;
}
