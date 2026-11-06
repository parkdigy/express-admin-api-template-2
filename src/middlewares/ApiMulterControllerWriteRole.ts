/********************************************************************************************************************
 * API Multer Write 권한 검사 미들웨어
 * - 메뉴의 Write 권한이 있는지 검사
 * ******************************************************************************************************************/

import ApiMenuRoleChecker from './ApiMenuRoleChecker';
import { type MyAuthController, type MyController } from '@types';
import { type RequestHandler } from 'express';
import ApiMulterController from './ApiMulterController';

export default function (
  menus: string | string[],
  multer: RequestHandler,
  controller: MyController | MyAuthController,
  logging = true,
  loggingData = false
): any[] {
  return [
    ApiMenuRoleChecker(menus, menu.Role.Write),
    ApiMulterController(multer, controller, true, logging, loggingData),
  ];
}
