/********************************************************************************************************************
 * API 권한 검사 미들웨어
 * - 사용자가 속한 그룹에 주어진 메뉴의 Read/Write/Export 권한이 있는지 검사
 * - Super Admin 메뉴 체크
 * - 모든 사용자 메뉴 체크
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default function (menus: string | string[], role = menu.Role.Read) {
  return async (req: MyRequest, res: MyResponse, next: NextFunction) => {
    if (!req.$$user) {
      api.error(res, api.Error.Permission);
      return;
    }

    const is_super_admin = req.$$user.is_super_admin;
    const admin_group_id = req.$$user.admin_group_id;

    // Super Admin 이면 통과
    if (is_super_admin) {
      next();
      return;
    }

    // 체크 권한이 All 이면 통과
    if (role === menu.Role.All) {
      next();
      return;
    }

    // 메뉴가 주어지지 않거나, 권한이 주어지지 않으면 에러
    if (empty(menus) || empty(role)) {
      api.error(res, api.Error.Permission);
      return;
    }

    // Super Admin 메뉴 권한 체크
    if (role === menu.Role.Super && !is_super_admin) {
      api.error(res, api.Error.Permission);
      return;
    }

    // 소속된 그룹이 없으면 에러
    if (admin_group_id === 0) {
      api.error(res, api.Error.Permission);
      return;
    }

    menus = Array.isArray(menus) ? menus : [menus];

    let granted = false;

    // 주어진 메뉴에 all 메뉴가 있으면 통과
    for (const adminMenuId of menus) {
      if (adminMenuId === menu.all) {
        granted = true;
        break;
      }
    }

    if (!granted) {
      // 메뉴의 권한 목록 조회

      const agm = db.a.adminGroupMenu();
      const am = db.a.adminMenu();

      const adminGroupMenuList = await db.q.adminGroupMenu
        .select(agm, [
          db.columns(agm, 'read', 'write', 'export'),
          db.columns(am, 'is_super_admin_menu', 'is_all_user_menu'),
        ])
        .innerJoin(am, db.eq(am.id, agm.admin_menu_id))
        .where(
          db.and(agm, {
            eq: { admin_group_id },
            inArray: { admin_menu_id: menus },
          })
        );

      // 메뉴의 권한이 있는지 검사
      granted =
        adminGroupMenuList.find((item) => {
          if (item.is_all_user_menu) return true;
          if (item.is_super_admin_menu) {
            return is_super_admin;
          } else {
            return (
              (role === menu.Role.Read && item.read) ||
              (role === menu.Role.Write && item.write) ||
              (role === menu.Role.Export && item.export)
            );
          }
        }) != null;
    }

    // 권한이 없으면 에러
    if (!granted) {
      api.error(res, api.Error.Permission);
      return;
    }

    next();
  };
}
