import { and, or, eq, gt, isNull, type SQL } from 'drizzle-orm';
import { alias, boolean, int, mysqlTable, MySqlDialect } from 'drizzle-orm/mysql-core';
import { createConditions } from '@pdg/drizzle-mysql';

const conditions = createConditions({});

const table = mysqlTable('condition_test', {
  id: int().notNull(),
  isLock: boolean('is_lock').notNull(),
  optionalId: int('optional_id'),
});
const au = alias(table, 'au');
const dialect = new MySqlDialect();
const toQuery = (condition: SQL | undefined) => (condition ? dialect.sqlToQuery(condition) : undefined);

describe('object condition groups', () => {
  it.each(['and', 'or'] as const)('combines comparison operators with %s', (operator) => {
    const expected = (operator === 'and' ? and : or)(gt(au.id, 100), eq(au.isLock, false));

    expect(toQuery(conditions[operator](au, { gt: { id: 100 }, eq: { isLock: false } }))).toEqual(toQuery(expected));
  });

  it.each(['and', 'or'] as const)('omits undefined values with %s', (operator) => {
    expect(toQuery(conditions[operator](au, { gt: { id: 100 }, eq: { isLock: undefined } }))).toEqual(
      toQuery(gt(au.id, 100))
    );
    expect(conditions[operator](au, { gt: undefined, eq: { isLock: undefined } })).toBeUndefined();
  });

  it.each(['and', 'or'] as const)('supports null operators with %s', (operator) => {
    const expected = (operator === 'and' ? and : or)(gt(au.id, 100), isNull(au.optionalId));

    expect(toQuery(conditions[operator](au, { gt: { id: 100 }, isNull: 'optionalId' }))).toEqual(toQuery(expected));
  });

  it.each(['and', 'or'] as const)('still rejects unknown operators with %s', (operator) => {
    expect(() => Reflect.apply(conditions[operator], undefined, [au, { invalid: { id: 100 } }])).toThrow(
      'Condition: unknown operator "invalid".'
    );
  });

  it('preserves native SQL condition composition', () => {
    expect(toQuery(conditions.and(gt(au.id, 100), conditions.or(eq(au.isLock, false), undefined)))).toEqual(
      toQuery(and(gt(au.id, 100), or(eq(au.isLock, false))))
    );
  });
});
