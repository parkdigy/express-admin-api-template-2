/********************************************************************************************************************
 * 기본 Multer Controller 미들웨어
 * - 세션 인증 검사 실행 (선택)
 * - Starter 실행
 * - 오류가 없으면, Transaction Commit 실행
 * - 오류가 있으면, Transaction Rollback 실행
 * - Finisher 실행
 * ******************************************************************************************************************/

import { type MyAuthController, type MyController } from '@types';
import { type RequestHandler } from 'express';
import { MulterOriginalNameChanger, MulterRemover } from './Multer';
import Controller from './Controller';

export default function (
  multer: RequestHandler,
  controller: MyController | MyAuthController,
  sessionAuthCheck = false
) {
  return Controller(controller, sessionAuthCheck, [multer, MulterOriginalNameChanger], [MulterRemover]);
}
