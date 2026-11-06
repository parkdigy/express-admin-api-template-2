import { mysqlTable, int, varchar, datetime, mysqlEnum } from '@pdg/drizzle-mysql';
import { type UserId, UserStatus } from '@const';

export const user = mysqlTable('user', {
  id: int({ unsigned: true }).autoincrement().primaryKey().$type<UserId>(),
  email: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 500 }).notNull(),
  login_fail_count: int().notNull().default(0).insertBlocked(),
  status: mysqlEnum(UserStatus.getList()).notNull().default(UserStatus.On).$type<UserStatus>(),
  create_date: datetime({ mode: 'string' }).notNull().createdAt(),
  update_date: datetime({ mode: 'string' }).notNull().updatedAt(),
});
