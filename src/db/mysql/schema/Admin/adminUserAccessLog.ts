import { mysqlTable, bigint, int, varchar, datetime } from '@pdg/drizzle-mysql';
import type { AdminUserAccessKeyId, AdminUserAccessLogId, AdminUserId } from '@const';

export const adminUserAccessLog = mysqlTable('admin_user_access_log', {
  id: bigint({ mode: 'number', unsigned: true }).autoincrement().primaryKey().$type<AdminUserAccessLogId>(),
  admin_user_id: int({ unsigned: true }).notNull().$type<AdminUserId>(),
  admin_user_access_key_id: varchar({ length: 200 }).notNull().$type<AdminUserAccessKeyId>(),
  url: varchar({ length: 255 }).notNull(),
  create_date: datetime({ mode: 'string' }).notNull().createdAt(),
});
