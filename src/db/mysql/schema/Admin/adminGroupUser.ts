import { mysqlTable, int } from '@pdg/drizzle-mysql';
import type { AdminGroupId, AdminUserId } from '@const';

export const adminGroupUser = mysqlTable('admin_group_user', {
  admin_group_id: int({ unsigned: true }).primaryKey().$type<AdminGroupId>(),
  admin_user_id: int({ unsigned: true }).primaryKey().$type<AdminUserId>(),
});
