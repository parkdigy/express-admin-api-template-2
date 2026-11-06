import { Param_DateFrom_Required, Param_DateTo_Required, Param_Enum, Param_String } from '@common_param';
import { AdminUserAccessKeyType } from '@const';
import { AdminUserAccessLogKeywordOption } from '@db';

export const AdminUserAccessLogListParam = {
  search_date_from: Param_DateFrom_Required(),
  search_date_to: Param_DateTo_Required(),
  keyword_option: Param_Enum(AdminUserAccessLogKeywordOption),
  keyword: Param_String(),
  type: Param_Enum(AdminUserAccessKeyType.getList()),
};
