/********************************************************************************************************************
 * 어드민 다운로드 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { AdminUserAccessLog, AdminUser, AdminUserLoginLog, AdminPrivacyAccessLog } from '@controllers';
import { ApiControllerExportRole } from '@middlewares';

const router = express.Router();

// 어드민 사용자 사용 로그 다운로드
router.get('/user_access_log', ApiControllerExportRole(menu.admin.accessLog, AdminUserAccessLog.exportList));

// 어드민 사용자 목록 다운로드
router.get('/user', ApiControllerExportRole(menu.admin.user, AdminUser.exportList));

// 어드민 사용자 로그인 로그 다운로드
router.get('/login_log', ApiControllerExportRole(menu.admin.loginLog, AdminUserLoginLog.exportList));

// 어드민 개인정보 조회 로그 다운로드
router.get(
  '/privacy_access_log',
  ApiControllerExportRole(menu.admin.privacyAccessLog, AdminPrivacyAccessLog.exportList)
);

export default router;
