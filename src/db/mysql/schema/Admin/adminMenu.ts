import { mysqlTable, int, varchar, boolean } from '@pdg/drizzle-mysql';
import type { AdminMenuId } from '@const';

export const adminMenu = mysqlTable('admin_menu', {
  id: varchar({ length: 100 }).primaryKey().updateAllowed().$type<AdminMenuId>(),
  name: varchar({ length: 50 }).notNull(),
  depth: int().notNull(),
  parent_id: varchar({ length: 100 }),
  uri: varchar({ length: 100 }),
  is_super_admin_menu: boolean().default(false).notNull(),
  is_all_user_menu: boolean().default(false).notNull(),
  icon: varchar({ length: 50 }),
  seq: int().notNull(),
});
