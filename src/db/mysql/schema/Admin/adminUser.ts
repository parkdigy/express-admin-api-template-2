import { mysqlTable, boolean, int, varchar, datetime } from '@pdg/drizzle-mysql';
import type { AdminUserId } from '@const';

export const adminUser = mysqlTable('admin_user', {
  id: int({ unsigned: true }).autoincrement().primaryKey().$type<AdminUserId>(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 50 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  tel: varchar({ length: 20 }).notNull(),
  must_password_change: boolean().default(true).notNull().insertBlocked(),
  is_lock: boolean().default(false).notNull().insertBlocked(),
  login_fail_count: int().default(0).notNull().insertBlocked(),
  remember_token: varchar({ length: 100 }).insertBlocked(),
  create_date: datetime().notNull().createdAt(),
  update_date: datetime().notNull().updatedAt(),
});
