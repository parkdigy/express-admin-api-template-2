import { mysqlTable, bigint, int, text, varchar, datetime } from '@pdg/drizzle-mysql';
import type { AdminUserActivityId, AdminUserActivityTypeId, AdminUserId } from '@const';

export const adminUserActivity = mysqlTable('admin_user_activity', {
  id: bigint({ mode: 'number', unsigned: true }).autoincrement().primaryKey().$type<AdminUserActivityId>(),
  admin_user_activity_type_id: int({ unsigned: true }).notNull().$type<AdminUserActivityTypeId>(),
  parent_id: varchar({ length: 50 }),
  admin_user_id: int({ unsigned: true }).notNull().$type<AdminUserId>(),
  activity_text_1: text(),
  activity_text_2: text(),
  memo: text(),
  create_date: datetime({ mode: 'string' }).notNull().createdAt(),
  update_date: datetime({ mode: 'string' }).notNull().updatedAt(),
});
