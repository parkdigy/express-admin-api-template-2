import { Param_Boolean, Param_Enum, Param_Integer, Param_String } from '@common_param';
import { AdminUserListKeywordOption } from '@db';

export const AdminUserListParam = {
  type: Param_Enum(['all'] as const),
  keyword_option: Param_Enum(AdminUserListKeywordOption),
  keyword: Param_String(),
  is_lock: Param_Boolean(),
  admin_group_id: Param_Integer(),
};
