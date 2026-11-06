import { mysqlTable, int, varchar, boolean } from '@pdg/drizzle-mysql';
import type { AdminGroupId, AdminMenuId } from '@const';

export const adminGroupMenu = mysqlTable('admin_group_menu', {
  admin_group_id: int({ unsigned: true }).primaryKey().$type<AdminGroupId>(),
  admin_menu_id: varchar({ length: 50 }).default('').primaryKey().$type<AdminMenuId>(),
  read: boolean().default(false).notNull(),
  write: boolean().default(false).notNull(),
  export: boolean().default(false).notNull(),
});
