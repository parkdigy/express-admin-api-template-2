/********************************************************************************************************************
 * 인증 컨트롤러
 * ******************************************************************************************************************/

import { Param_Email_Required, Param_Password_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 로그인 정보
   * ******************************************************************************************************************/
  getInfo(req: MyAuthRequest, res: MyResponse) {
    api.success(res, {
      email: req.$$user.email,
    });
  },

  /********************************************************************************************************************
   * 로그인
   * ******************************************************************************************************************/
  async signIn(req: MyAuthRequest, res: MyResponse) {
    const { email, password } = param(req, { email: Param_Email_Required(), password: Param_Password_Required() });

    const userInfo = await db.q.user.infoForSignIn(email);
    if (!userInfo) throw api.newExceptionError('이메일 또는 비밀번호가 일치하지 않습니다.');
    if (userInfo.status === 'OFF') throw api.newExceptionError('계정이 중지 상태입니다.');
    if (userInfo.status === 'LOCK') throw api.newExceptionError('계정이 잠금 상태입니다.');

    if (!util.password.check(password, userInfo.password)) {
      const failCount = userInfo.login_fail_count + 1;
      if (failCount >= 5) {
        await db.q.user.editByPrimaryKey({ login_fail_count: failCount, status: 'LOCK' }, userInfo.id);

        throw api.newExceptionError('계정이 잠금 상태입니다.');
      } else {
        await db.q.user.editByPrimaryKey({ login_fail_count: failCount }, userInfo.id);

        throw api.newExceptionError({
          text: '비밀번호가 일치하지 않습니다. :lockCount회 연속 실패 시 계정이 차단됩니다. 현재 :failCount회 실패 상태입니다.',
          html: '비밀번호가 일치하지 않습니다.<br/><b>:lockCount회</b> 연속 실패 시 계정이 차단됩니다.<br/>현재 <b>:failCount회</b> 실패 상태입니다.',
          replace: { lockCount: 5, failCount },
        });
      }
    }

    if (userInfo.login_fail_count > 0) {
      await db.q.user.editByPrimaryKey({ login_fail_count: 0 }, userInfo.id);
    }

    jwt.saveAccessToken(req, res, userInfo.id);

    api.success(res, {
      email: userInfo.email,
    });
  },

  /********************************************************************************************************************
   * 로그아웃
   * ******************************************************************************************************************/
  signOut(req: MyAuthRequest, res: MyResponse) {
    jwt.clearAccessToken(res);

    api.success(res);
  },
};
