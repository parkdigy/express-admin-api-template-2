import { mysqlTable, int, varchar, datetime } from '@pdg/drizzle-mysql';
import type { AdminUserId, AdminUserLoginLogId } from '@const';

export const adminUserLoginLog = mysqlTable('admin_user_login_log', {
  id: int({ unsigned: true }).autoincrement().primaryKey().$type<AdminUserLoginLogId>(),
  admin_user_id: int().notNull().$type<AdminUserId>(),
  ip_address: varchar({ length: 20 }).notNull(),
  ip_country: varchar({ length: 50 }).notNull(),
  ip_city: varchar({ length: 50 }).notNull(),
  create_date: datetime().notNull().createdAt(),
});
