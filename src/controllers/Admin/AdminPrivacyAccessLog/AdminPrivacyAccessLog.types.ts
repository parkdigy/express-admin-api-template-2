import { Param_DateFrom_Required, Param_DateTo_Required, Param_Enum, Param_Integer } from '@common_param';
import { AdminPrivacyAccessLogType } from '@const';

export const AdminPrivacyAccessLogListParams = {
  search_date_from: Param_DateFrom_Required(),
  search_date_to: Param_DateTo_Required(),
  type: Param_Enum(AdminPrivacyAccessLogType.getList()),
  admin_user_id: Param_Integer(),
};
