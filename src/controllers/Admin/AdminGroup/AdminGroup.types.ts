import { OmitParam, Param_Array, Param_Boolean, Param_String, Param_String_Required } from '@common_param';

export const AdminGroupAddParam = {
  name: Param_String_Required(),
  is_lock: Param_Boolean({ defaultValue: false }),
  is_privacy_access: Param_Boolean({ defaultValue: false }),
  users: Param_Array('number'),
  menu: Param_String(),
};

export const AdminGroupEditParam = OmitParam(AdminGroupAddParam, 'is_lock');
