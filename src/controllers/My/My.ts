/********************************************************************************************************************
 * 내 정보 Controller
 * ******************************************************************************************************************/

import { Param_Password_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 비밀번호 변경
   * ******************************************************************************************************************/
  async passwordChange(req: MyAuthRequest, res: MyResponse) {
    const { id: userId, must_password_change: mustPasswordChange } = req.$$user;

    const { new_password } = param(req, { new_password: Param_Password_Required() });

    await db.q.adminUser.editByPrimaryKey(
      {
        password: util.password.hash(new_password),
        must_password_change: false,
      },
      userId
    );

    api.successMsg(res, '비밀번호가 변경되었습니다.', undefined, mustPasswordChange ? '/' : undefined);
  },

  /********************************************************************************************************************
   * API 호출 권한 등록
   * ******************************************************************************************************************/
  async apiCallPermission(req: MyAuthRequest, res: MyResponse) {
    const { password } = param(req, { password: Param_Password_Required() });

    const info = await db.q.adminUser.findByPrimaryKey(['password'], req.$$user.id);
    if (!info) throw api.newExceptionError();

    if (!util.password.check(password, info.password)) {
      throw api.newExceptionError('비밀번호가 일치하지 않습니다.');
    }

    req.session.$$apiCallPermissionTime = now().getTime();

    api.success(res);
  },
};
