/********************************************************************************************************************
 * 기본 API Multer Controller 미들웨어
 * - 로깅 기록 (선택)
 * - Starter 실행
 * - 오류가 없으면, Transaction Commit 실행
 * - 오류가 있으면, Transaction Rollback 실행
 * - Finisher 실행
 * ******************************************************************************************************************/

import { type MyAuthController, type MyController } from '@types';
import { type RequestHandler } from 'express';
import { MulterOriginalNameChanger, MulterRemover } from './Multer';
import ApiController from './ApiController';
import ApiJwtCookieAuthChecker from './ApiJwtCookieAuthChecker';

export default function (
  multer: RequestHandler,
  controller: MyController | MyAuthController,
  logging = true,
  loggingData = false
) {
  return ApiController(
    controller,
    logging,
    loggingData,
    [multer, ApiJwtCookieAuthChecker, MulterOriginalNameChanger],
    [MulterRemover]
  );
}
