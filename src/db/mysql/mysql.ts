import { drizzleMySql, type MySqlTransactionHandle } from '@pdg/drizzle-mysql';
import schema from './schema';
import 'dotenv/config';

export const mysql = drizzleMySql({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  timezone: 'local',
  getTimestamp: () => new Date(),
  schema,
});

export default {
  ...mysql,
  fakeTrans: async (callback: (transaction: MySqlTransactionHandle) => Promise<unknown>) => {
    await callback({
      rollback: async () => {},
    });
  },
};
