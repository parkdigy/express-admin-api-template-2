import { mysqlTable, mysqlEnum, varchar } from '@pdg/drizzle-mysql';
import { type AdminUserAccessKeyId, AdminUserAccessKeyType } from '@const';

export const adminUserAccessKey = mysqlTable('admin_user_access_key', {
  id: varchar({ length: 200 }).primaryKey().$type<AdminUserAccessKeyId>(),
  type: mysqlEnum(['VIEW', 'EXPORT']).notNull().$type<AdminUserAccessKeyType>(),
  title: varchar({ length: 100 }).notNull(),
});
