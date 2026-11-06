import mysql from './mysql';
import mysqlQuery from './mysql/query';

const db = {
  ...mysql,
  q: mysqlQuery,
};

export default db;
