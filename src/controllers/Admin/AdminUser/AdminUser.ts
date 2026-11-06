/********************************************************************************************************************
 * 어드민 사용자 Controller
 * ******************************************************************************************************************/

import { AdminUserListParam } from './AdminUser.types';
import {
  Param_Email_Required,
  Param_Id_Integer_Required,
  Param_Integer,
  Param_Mobile_Required,
  Param_Page_Limit,
  Param_String_Required,
} from '@common_param';
import { formatTelNo } from '@pdg/formatting';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyAuthRequest, res: MyResponse) {
    const isSuperAdmin = req.$$user.is_super_admin;

    const { page, limit } = param(req, Param_Page_Limit());
    const { type, keyword_option, keyword, is_lock, admin_group_id } = param(req, AdminUserListParam);

    if (type === 'all') {
      // 전체 관리자 목록
      let list = await db.q.adminUser.allList({ is_lock });
      if (!req.$$user.is_super_admin) {
        list = list.filter((info) => info.admin_group_id !== SUPER_ADMIN_GROUP_ID);
      }
      api.success(res, list);
    } else {
      // 관리자 목록
      const { data, paging } = await db.paginate(
        db.q.adminUser.list({
          keyword_option,
          keyword,
          is_lock,
          admin_group_id,
        }),
        page,
        limit
      );

      const finalData = !req.$$user.is_super_admin
        ? data.filter((info) => info.admin_group_id !== SUPER_ADMIN_GROUP_ID)
        : data;

      api.success(
        res,
        finalData.map((info) => ({ ...info, editable: info.admin_group_id !== SUPER_ADMIN_GROUP_ID || isSuperAdmin })),
        paging
      );
    }
  },

  /********************************************************************************************************************
   * 목록 엑셀 다운로드
   * ******************************************************************************************************************/
  async exportList(req: MyAuthRequest, res: MyResponse) {
    const { keyword_option, keyword, is_lock, admin_group_id } = param(req, AdminUserListParam);

    const list = await db.q.adminUser.list({
      keyword_option,
      keyword,
      is_lock: is_lock,
      admin_group_id,
    });

    excel.export(res, `사용자_${dayjs().format('YYYYMMDD')}.xlsx`, list, [
      excel.newColumn('ID', 'id', 10, 'c'),
      excel.newColumn('이메일', 'email', 30, 'l'),
      excel.newColumn('이름', 'name', 20, 'c'),
      excel.newColumn('전화번호', 'tel', 20, 'c', (v) => formatTelNo(v)),
      excel.newColumn('그룹분류', 'admin_group_name', 20, 'c'),
      excel.newColumn('계정상태', 'is_lock', 10, 'c', (v) => (v ? '제한' : '정상')),
      excel.newColumn('생성일', 'create_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
    ]);
  },

  /********************************************************************************************************************
   * 정보
   * ******************************************************************************************************************/
  async info(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    const info = await db.q.adminUser.info(id);
    if (!info) throw paramError();

    api.success(res, { ...info, editable: info.admin_group_id !== SUPER_ADMIN_GROUP_ID || req.$$user.is_super_admin });
  },

  /********************************************************************************************************************
   * 등록
   * ******************************************************************************************************************/
  async add(req: MyAuthRequest, res: MyResponse) {
    const { email, name, tel, admin_group_id } = param(req, {
      email: Param_Email_Required(),
      name: Param_String_Required(),
      tel: Param_Mobile_Required(),
      admin_group_id: Param_Integer(),
    });

    // 존재하는 그룹인지 검사
    if (admin_group_id) {
      if (await db.q.adminGroup.notExistsByPrimaryKey(admin_group_id)) {
        throw api.Error.Parameter;
      }
    }

    // 이메일 중복 검사
    if (await db.q.adminUser.existsEmail(email)) {
      throw api.newExceptionError('이미 등록된 이메일입니다.');
    }

    await db.trans(async () => {
      // 사용자 등록
      const password = util.password.hash(tel.replace(/-/g, ''));
      const adminUserId = await db.q.adminUser.add({ email, password, name, tel });
      if (!adminUserId) {
        throw api.newExceptionError('사용자 등록 중 오류가 발생했습니다.');
      }

      // 그룹/사용자 등록
      if (admin_group_id) {
        await db.q.adminGroupUser.add({ admin_group_id, admin_user_id: adminUserId });
      }
    });

    api.successMsg(res, '사용자가 등록되었습니다.');
  },

  /********************************************************************************************************************
   * 수정
   * ******************************************************************************************************************/
  async edit(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());
    const { name, tel, admin_group_id } = param(req, {
      name: Param_String_Required(),
      tel: Param_Mobile_Required(),
      admin_group_id: Param_Integer(),
    });

    // 존재하는 사용자인 검사
    const userInfo = await db.q.adminUser.info(id);
    if (!userInfo) throw api.Error.Parameter;

    if (userInfo.admin_group_id === SUPER_ADMIN_GROUP_ID && !req.$$user.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹에 속한 사용자는 수정할 수 없습니다.');
    }
    if (!req.$$user.is_super_admin && admin_group_id === SUPER_ADMIN_GROUP_ID) {
      throw api.newExceptionError('Super Admin 그룹으로 변경할 수 없습니다.');
    }

    await db.trans(async () => {
      // 사용자 정보 수정
      const updateData = db.q.adminUser.updateValues({});
      if (name !== userInfo.name) updateData.name = name;
      if (tel !== userInfo.tel) updateData.tel = tel;
      if (userInfo.must_password_change && tel !== userInfo.tel) {
        updateData.password = util.password.hash(tel.replace(/-/g, ''));
      }
      if (notEmpty(updateData)) {
        if (!(await db.q.adminUser.editByPrimaryKey(updateData, id))) {
          throw api.newExceptionError('사용자 정보 수정 중 오류가 발생했습니다.');
        }
      }

      // 그룹/사용자 등록/수정
      if (admin_group_id) {
        const groupInfo = await db.q.adminGroup.findByPrimaryKey(admin_group_id);
        if (!groupInfo) throw api.Error.Parameter;

        const groupUserInfo = await db.q.adminGroupUser.find((q) => q.eq({ admin_user_id: id }));
        if (groupUserInfo) {
          if (groupUserInfo.admin_group_id !== admin_group_id) {
            // 그룹/사용자 수정
            if (!(await db.q.adminGroupUser.editAdminGroupId({ admin_user_id: id, admin_group_id }))) {
              throw api.newExceptionError('그룹/사용자 정보 수정 중 오류가 발생했습니다.');
            }
          }
        } else {
          // 그룹/사용자 등록
          if (!(await db.q.adminGroupUser.add({ admin_group_id, admin_user_id: id }))) {
            throw api.newExceptionError('그룹/사용자 등록 중 오류가 발생했습니다.');
          }
        }
      } else {
        if (await db.q.adminGroupUser.exists((q) => q.eq({ admin_user_id: id }))) {
          await db.q.adminGroupUser.remove((q) => q.eq({ admin_user_id: id }));
        }
      }
    });

    api.successMsg(res, '사용자 정보가 수정되었습니다.');
  },

  /********************************************************************************************************************
   * 비밀번호 초기화
   * ******************************************************************************************************************/
  async passwordReset(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    const userInfo = await db.q.adminUser.info(id);
    if (!userInfo) throw api.Error.Parameter;

    if (userInfo.admin_group_id === SUPER_ADMIN_GROUP_ID && !req.$$user.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹에 속한 사용자는 수정할 수 없습니다.');
    }

    const password = util.password.hash(userInfo.tel.replace(/-/g, ''));

    if (!(await db.q.adminUser.passwordChange(id, { password, must_password_change: true }))) {
      throw api.newExceptionError('사용자 비밀번호 초기화 중 오류가 발생했습니다.');
    }

    api.successMsg(res, '사용자의 비밀번호가 전화번호로 초기화되었습니다.');
  },

  /********************************************************************************************************************
   * 사용 제한
   * ******************************************************************************************************************/
  async lock(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    const userInfo = await db.q.adminUser.info(id);
    if (!userInfo) throw api.Error.Parameter;

    if (userInfo.admin_group_id === SUPER_ADMIN_GROUP_ID && !req.$$user.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹에 속한 사용자는 수정할 수 없습니다.');
    }

    if (!(await db.q.adminUser.lock(id))) {
      throw api.newExceptionError('사용 제한 중 오류가 발생했습니다.');
    }

    return api.successMsg(res, '사용이 제한되었습니다.');
  },

  /********************************************************************************************************************
   * 사용 제한 해제
   * ******************************************************************************************************************/
  async unlock(req: MyAuthRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    const userInfo = await db.q.adminUser.info(id);
    if (!userInfo) throw api.Error.Parameter;

    if (userInfo.admin_group_id === SUPER_ADMIN_GROUP_ID && !req.$$user.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹에 속한 사용자는 수정할 수 없습니다.');
    }

    if (!(await db.q.adminUser.unlock(id))) {
      throw api.newExceptionError('사용제한 해제 중 오류가 발생했습니다.');
    }

    return api.successMsg(res, '사용제한이 해제되었습니다.');
  },
};
