/********************************************************************************************************************
 * 어드민 라우터
 * ******************************************************************************************************************/

import express from 'express';
import {
  AdminMenu,
  AdminUserMenu,
  AdminUserAccessLog,
  AdminGroup,
  AdminUserActivity,
  AdminUser,
  AdminUserLoginLog,
  AdminPrivacyAccessLog,
} from '@controllers';
import { ApiController, ApiControllerReadRole, ApiControllerWriteRole, ApiSuperAdminChecker } from '@middlewares';

const router = express.Router();

/********************************************************************************************************************
 * 어드민 메뉴
 * ******************************************************************************************************************/
// 어드민 메뉴 - 목록
router.get('/menu', ApiSuperAdminChecker, ApiController(AdminMenu.list));
// 어드민 메뉴 - 등록
router.post('/menu', ApiSuperAdminChecker, ApiController(AdminMenu.add));
// 어드민 메뉴 - 순서 수정
router.patch('/menu/seq', ApiSuperAdminChecker, ApiController(AdminMenu.editSeq));
// 어드민 메뉴 - 정보
router.get('/menu/:id', ApiSuperAdminChecker, ApiController(AdminMenu.info));
// 어드민 메뉴 - 수정
router.patch('/menu/:id', ApiSuperAdminChecker, ApiController(AdminMenu.edit));
// 어드민 메뉴 - 삭제
router.delete('/menu/:id', ApiSuperAdminChecker, ApiController(AdminMenu.remove));
// 어드민 메뉴 - SUPER 권한 수정
router.patch('/menu/:id/super', ApiSuperAdminChecker, ApiController(AdminMenu.editSuper));
// 어드민 메뉴 - ALL 권한 수정
router.patch('/menu/:id/all', ApiSuperAdminChecker, ApiController(AdminMenu.editAll));

/********************************************************************************************************************
 * 어드민 사용자 메뉴
 * ******************************************************************************************************************/
// 어드민 사용자 메뉴 - 목록
router.get('/user_menu', ApiController(AdminUserMenu.list));
// 어드민 사용자 메뉴 - 그룹 수정용 목록
router.get('/user_menu/group', ApiControllerReadRole(menu.admin.group, AdminUserMenu.listForGroupEdit));

/********************************************************************************************************************
 * 어드민 사용자 사용 로그
 * ******************************************************************************************************************/
// 어드민 사용자 사용 로그 - 목록
router.get('/user_access_log', ApiControllerReadRole(menu.admin.accessLog, AdminUserAccessLog.list));
// 어드민 사용자 사용 로그 - 등록
router.post('/user_access_log', ApiController(AdminUserAccessLog.add));

/********************************************************************************************************************
 * 어드민 그룹
 * ******************************************************************************************************************/
// 어드민 그룹 - 목록
router.get('/group', ApiControllerReadRole([menu.admin.group, menu.admin.user], AdminGroup.list));
// 어드민 그룹 - 등록
router.post('/group', ApiControllerWriteRole(menu.admin.group, AdminGroup.add));
// 어드민 그룹 - 정보
router.get('/group/:id', ApiControllerReadRole(menu.admin.group, AdminGroup.info));
// 어드민 그룹 - 수정
router.patch('/group/:id', ApiControllerWriteRole(menu.admin.group, AdminGroup.edit));

/********************************************************************************************************************
 * 어드민 사용자 활동
 * ******************************************************************************************************************/
// 어드민 사용자 활동 - 목록
router.get('/user_activity', ApiController(AdminUserActivity.list));

/********************************************************************************************************************
 * 어드민 사용자
 * ******************************************************************************************************************/
// 어드민 사용자 - 목록
router.get('/user', ApiControllerReadRole(menu.admin.user, AdminUser.list));
// 어드민 사용자 - 등록
router.post('/user', ApiControllerWriteRole(menu.admin.user, AdminUser.add, true));
// 어드민 사용자 - 정보
router.get('/user/:id', ApiControllerReadRole(menu.admin.user, AdminUser.info));
// 어드민 사용자 - 정보 수정
router.patch('/user/:id', ApiControllerWriteRole(menu.admin.user, AdminUser.edit, true));
// 어드민 사용자 - 비밀번호 초기화
router.patch('/user/:id/password_reset', ApiControllerWriteRole(menu.admin.user, AdminUser.passwordReset, true));
// 어드민 사용자 - 사용 제한
router.patch('/user/:id/lock', ApiControllerWriteRole(menu.admin.user, AdminUser.lock, true));
// 어드민 사용자 - 사용 제한 해제
router.patch('/user/:id/unlock', ApiControllerWriteRole(menu.admin.user, AdminUser.unlock, true));

/********************************************************************************************************************
 * 어드민 사용자 로그인 로그
 * ******************************************************************************************************************/
// 어드민 사용자 로그인 로그 - 목록
router.get('/login_log', ApiControllerReadRole(menu.admin.loginLog, AdminUserLoginLog.list));

/********************************************************************************************************************
 * 어드민 개인정보 조회 로그
 * ******************************************************************************************************************/
// 어드민 개인정보 조회 로그 - 목록
router.get('/privacy_access_log', ApiControllerReadRole(menu.admin.privacyAccessLog, AdminPrivacyAccessLog.list));

export default router;
