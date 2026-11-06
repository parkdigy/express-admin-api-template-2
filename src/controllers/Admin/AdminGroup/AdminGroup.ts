/********************************************************************************************************************
 * 어드민 그룹 Controller
 * ******************************************************************************************************************/

import { AdminGroupAddParam, AdminGroupEditParam } from './AdminGroup.types';
import { Param_Boolean, Param_Id_Integer_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyAuthRequest, res: MyResponse) {
    const { is_lock } = param(req, { is_lock: Param_Boolean() });

    let list = await db.q.adminGroup.list({ is_lock, user_count: true });

    if (!req.$$user.is_super_admin) {
      list = list.filter((info) => info.id !== SUPER_ADMIN_GROUP_ID);
    }

    api.success(
      res,
      list.map((info) => ({
        ...info,
        editable: info.id !== SUPER_ADMIN_GROUP_ID || req.$$user.is_super_admin,
      }))
    );
  },

  /********************************************************************************************************************
   * 정보
   * ******************************************************************************************************************/
  async info(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    // 그룹 정보
    const info = await db.q.adminGroup.findByPrimaryKey(id);
    if (!info) throw paramError();

    // 그룹에 포함된 사용자 목록
    const users = (await db.q.adminGroupUser.listOfGroup({ admin_group_id: id })).map((item) => item.admin_user_id);

    api.success(res, {
      info: { ...info, editable: info.id !== SUPER_ADMIN_GROUP_ID || req.$$user.is_super_admin },
      users,
    });
  },

  /********************************************************************************************************************
   * 등록
   * ******************************************************************************************************************/
  async add(req: MyAuthRequest, res: MyResponse) {
    const { name, is_privacy_access, users, menu } = param(req, AdminGroupAddParam);

    // Super Admin 이 아닌 경우, Super Admin 그룹 소속 사용자 등록 시 에러
    if (users && !req.$$user.is_super_admin) {
      if (
        await db.q.adminGroupUser.exists((q) =>
          q.and({
            inArray: { admin_user_id: users },
            eq: { admin_group_id: SUPER_ADMIN_GROUP_ID },
          })
        )
      ) {
        throw api.newExceptionError('Super Admin 그룹에 소속된 사용자는 등록할 수 없습니다.');
      }
    }

    // 그룹명 중복 검사
    if (await db.q.adminGroup.exists((q) => q.eq({ name }))) {
      throw api.newExceptionError('이미 사용 중인 그룹명입니다.');
    }

    await db.trans(async () => {
      // 그룹 등록
      const admin_group_id = await db.q.adminGroup.add({ name, is_privacy_access });

      // 사용자 등록
      if (users) {
        await db.q.adminGroupUser.addUsers({ admin_group_id, admin_user_ids: users });
      }

      // 메뉴 등록
      if (menu) {
        await db.q.adminGroupMenu.addOrEditMenus({ admin_group_id, menus: JSON.parse(menu) });
      }
    });

    api.successMsg(res, '그룹이 등록되었습니다.');
  },

  /********************************************************************************************************************
   * 수정
   * ******************************************************************************************************************/
  async edit(req: MyAuthRequest, res: MyResponse) {
    const { id: admin_group_id } = param(req, Param_Id_Integer_Required());
    const { name, is_privacy_access, users, menu } = param(req, AdminGroupEditParam);

    if (admin_group_id === SUPER_ADMIN_GROUP_ID && !req.$$user.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹은 수정할 수 없습니다.');
    }

    // Super Admin 이 아닌 경우, Super Admin 그룹 소속 사용자 등록 시 에러
    if (users && !req.$$user.is_super_admin) {
      if (
        await db.q.adminGroupUser.exists((q) =>
          q.and({ inArray: { admin_user_id: users }, eq: { admin_group_id: SUPER_ADMIN_GROUP_ID } })
        )
      ) {
        throw api.newExceptionError('Super Admin 그룹에 소속된 사용자는 수정할 수 없습니다.');
      }
    }

    // 그룹 정보
    const groupInfo = await db.q.adminGroup.findByPrimaryKey(admin_group_id);
    if (!groupInfo) throw paramError('id');
    if (groupInfo.is_lock) throw api.newExceptionError('사용제한 상태입니다. 수정할 수 없습니다.');

    // Begin Transaction
    await db.trans(async () => {
      // 그룹 정보 수정
      const updateData = db.q.adminGroup.updateValues({});

      if (groupInfo.name !== name) {
        if (admin_group_id === SUPER_ADMIN_GROUP_ID)
          throw api.newExceptionError('Super Admin 그룹명은 수정할 수 없습니다.');

        // 그룹명 중복 검사
        if (await db.q.adminGroup.exists((q) => q.eq({ name }))) {
          throw api.newExceptionError('이미 사용 중인 그룹명입니다.');
        }
        updateData.name = name;
      }

      if (Boolean(groupInfo.is_privacy_access) !== is_privacy_access) {
        updateData.is_privacy_access = is_privacy_access;
      }

      if (notEmpty(updateData)) {
        // 그룹 정보 수정
        await db.q.adminGroup.editByPrimaryKey(updateData, admin_group_id);
      }

      // 그룹의 전체 사용자 삭제
      await db.q.adminGroupUser.removeAllUserOfGroup(admin_group_id);

      // 사용자 등록
      if (users) {
        await db.q.adminGroupUser.addUsers({ admin_group_id, admin_user_ids: users });
      }

      // 메뉴 등록/수정
      if (menu != null) {
        await db.q.adminGroupMenu.addOrEditMenus({ admin_group_id, menus: JSON.parse(menu) });
      }
    });

    api.successMsg(res, '그룹 정보가 수정되었습니다.');
  },
};
