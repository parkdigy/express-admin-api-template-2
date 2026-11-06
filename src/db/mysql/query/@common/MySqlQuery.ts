import { MySqlQuery as BaseQuery } from '@pdg/drizzle-mysql';
import schema from '../../schema';
import { mysql } from '../../mysql';

export abstract class MySqlQuery<K extends keyof typeof schema> extends BaseQuery<(typeof schema)[K]> {
  constructor(table: K) {
    super(schema[table], mysql.current);
  }
}
