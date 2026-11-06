import { Param_Enum_Required, Param_Integer_Required, Param_String_Required } from '@common_param';
import { AdminPrivacyAccessLogType } from '@const';

export default {
  async info(req: MyAuthRequest, res: MyResponse) {
    if (!req.$$user.is_privacy_access) throw api.newExceptionError('개인정보 조회 권한이 없습니다.');

    const { type, parent_id, reason } = param(req, {
      type: Param_Enum_Required(AdminPrivacyAccessLogType.getList()),
      parent_id: Param_Integer_Required(),
      reason: Param_String_Required(),
    });

    let value: string;

    switch (type) {
      case AdminPrivacyAccessLogType.Test:
        value = `${parent_id}`;
        break;
      default:
        throw paramError('type');
    }

    await db.q.adminPrivacyAccessLog.add({
      admin_user_id: req.$$user.id,
      type,
      parent_id,
      reason,
    });

    api.success(res, { value });
  },
};
