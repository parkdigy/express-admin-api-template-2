import { mysqlTable, int, varchar } from '@pdg/drizzle-mysql';
import type { AdminUserActivityTypeId } from '@const';

export const adminUserActivityType = mysqlTable('admin_user_activity_type', {
  id: int({ unsigned: true }).primaryKey().$type<AdminUserActivityTypeId>(),
  name: varchar({ length: 50 }).notNull(),
});
