/********************************************************************************************************************
 * 어드민 사용자 활동 Controller
 * ******************************************************************************************************************/
import { Param_Integer_Required, Param_Page_Limit } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyAuthRequest, res: MyResponse) {
    const { page, limit } = param(req, Param_Page_Limit());
    const { user_activity_type_id, parent_id } = param(req, {
      user_activity_type_id: Param_Integer_Required(),
      parent_id: Param_Integer_Required(),
    });

    const { data, paging } = await db.paginate(
      db.q.adminUserActivity.list({ user_activity_type_id, parent_id }),
      page,
      limit
    );

    api.success(res, data, paging);
  },
};
