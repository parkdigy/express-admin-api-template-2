import { drizzleMySql } from '@pdg/drizzle-mysql';
import schema from './schema';
import 'dotenv/config';

let url = `${encodeURIComponent(process.env.DB_CONNECTION)}://`;
url += `${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@`;
url += `${encodeURIComponent(process.env.DB_HOST)}:${encodeURIComponent(process.env.DB_PORT)}/`;
url += encodeURIComponent(process.env.DB_DATABASE);

export const mysql = drizzleMySql({
  url: url,
  schema,
  getTimestamp: () => util.dateTime.format(now()),
});

export default mysql;
