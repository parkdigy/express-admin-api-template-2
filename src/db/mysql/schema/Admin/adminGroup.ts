import { mysqlTable, int, varchar, boolean } from '@pdg/drizzle-mysql';
import type { AdminGroupId } from '@const';

export const adminGroup = mysqlTable('admin_group', {
  id: int({ unsigned: true }).autoincrement().primaryKey().$type<AdminGroupId>(),
  name: varchar({ length: 50 }).notNull(),
  is_lock: boolean().default(false).notNull(),
  is_privacy_access: boolean().default(false).notNull(),
});
