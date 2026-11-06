/********************************************************************************************************************
 * API Read 권한 검사 미들웨어
 * - 메뉴의 Read 권한이 있는지 검사
 * ******************************************************************************************************************/

import ApiMenuRoleChecker from './ApiMenuRoleChecker';
import ApiController from './ApiController';
import { type MyAuthController, type MyController } from '@types';
import { type RequestHandler } from 'express';

export default function (
  menus: string | string[],
  controller: MyController | MyAuthController,
  logging = true,
  loggingData = false,
  afterStartMiddlewares: RequestHandler[] = [],
  beforeFinishMiddlewares: RequestHandler[] = []
): any[] {
  return [
    ApiMenuRoleChecker(menus, menu.Role.Read),
    ApiController(controller, false, logging, loggingData, afterStartMiddlewares, beforeFinishMiddlewares),
  ];
}
