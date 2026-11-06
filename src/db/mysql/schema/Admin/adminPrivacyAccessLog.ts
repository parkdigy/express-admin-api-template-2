import { mysqlTable, bigint, int, varchar, datetime } from '@pdg/drizzle-mysql';
import { type AdminPrivacyAccessLogId, AdminPrivacyAccessLogType, type AdminUserId } from '@const';

export const adminPrivacyAccessLog = mysqlTable('admin_privacy_access_log', {
  id: bigint({ mode: 'number', unsigned: true }).autoincrement().primaryKey().$type<AdminPrivacyAccessLogId>(),
  admin_user_id: int({ unsigned: true }).notNull().$type<AdminUserId>(),
  type: varchar({ length: 50 }).notNull().$type<AdminPrivacyAccessLogType>(),
  reason: varchar({ length: 100 }).notNull(),
  parent_id: bigint({ mode: 'number' }).notNull(),
  create_date: datetime({ mode: 'string' }).notNull().createdAt(),
});
