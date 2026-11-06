import { Param_DateFrom_Required, Param_DateTo_Required, Param_Enum, Param_String } from '@common_param';
import { AdminUserLoginLogKeywordOption } from '@db';

export const AdminUserLoginLogListParam = {
  login_date_from: Param_DateFrom_Required(),
  login_date_to: Param_DateTo_Required(),
  keyword_option: Param_Enum(AdminUserLoginLogKeywordOption),
  keyword: Param_String(),
};
