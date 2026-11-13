import Controller from '../../src/middlewares/Controller';
import { type MyRequest, type MyResponse } from '../../src/@types';
import drizzleMySql from '../../src/db/mysql/mysql';
import mysql from 'mysql2/promise';
import '../../src/init/global.error';

jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({ query: jest.fn(), getConnection: jest.fn() })),
}));

describe('Controller error response', () => {
  const poolResult = jest.mocked(mysql.createPool).mock.results[0];
  if (!poolResult || poolResult.type !== 'return') throw new Error('MySQL pool mock was not initialized');
  const query = poolResult.value.query as jest.Mock;
  const getConnection = poolResult.value.getConnection as jest.Mock;
  const connection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  };
  const originalPrintError = globalThis.printError;

  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue([[], []]);
    getConnection.mockReset().mockResolvedValue(connection);
    connection.beginTransaction.mockReset().mockResolvedValue(undefined);
    connection.commit.mockReset().mockResolvedValue(undefined);
    connection.rollback.mockReset().mockResolvedValue(undefined);
    connection.release.mockReset();
    globalThis.printError = jest.fn();
  });

  afterEach(() => {
    globalThis.printError = originalPrintError;
  });

  it('logs the internal error and returns only a standardized response', async () => {
    const internalError = new Error('SQL failed password=database-secret');

    const res = {
      headersSent: false,
      status: jest.fn(),
      send: jest.fn(),
    };
    res.status.mockReturnValue(res);
    res.send.mockReturnValue(res);
    const next = jest.fn();
    const middlewares = Controller(async () => {
      throw internalError;
    });

    const handler = middlewares[1];
    if (!handler) throw new Error('Controller handler was not created');
    await handler({} as MyRequest, res as unknown as MyResponse, next);

    expect(globalThis.printError).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalled();
    expect(getConnection).not.toHaveBeenCalled();
    expect(globalThis.printError).toHaveBeenCalledWith(expect.anything(), internalError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      result: { c: -1, m: '요청 처리 중 오류가 발생했습니다.' },
    });
    expect(JSON.stringify(res.send.mock.calls)).not.toContain('database-secret');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    'returns the standardized response after a transaction fails (rollback fails: %s)',
    async (rollbackFails) => {
      const controllerError = new Error('controller database detail');
      const rollbackError = new Error('rollback database detail');
      if (rollbackFails) {
        connection.rollback.mockRejectedValueOnce(rollbackError);
      }
      const req = {} as MyRequest;
      const next = jest.fn();
      const res = {
        headersSent: false,
        status: jest.fn(),
        send: jest.fn(),
      };
      res.status.mockReturnValue(res);
      res.send.mockReturnValue(res);
      const baseline = drizzleMySql.current();
      const middlewares = Controller(async () => {
        await drizzleMySql.trans(async () => {
          expect(drizzleMySql.current()).not.toBe(baseline);
          throw controllerError;
        });
      });

      const handler = middlewares[1];
      if (!handler) throw new Error('Controller handler was not created');
      await handler(req, res as unknown as MyResponse, next);

      expect(query).not.toHaveBeenCalled();
      expect(getConnection).toHaveBeenCalledTimes(1);
      expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(connection.rollback).toHaveBeenCalledTimes(1);
      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalledTimes(1);
      expect(drizzleMySql.current()).toBe(baseline);
      expect(globalThis.printError).toHaveBeenCalledTimes(1);
      expect(globalThis.printError).toHaveBeenCalledWith(req, controllerError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        result: { c: -1, m: '요청 처리 중 오류가 발생했습니다.' },
      });
      expect(JSON.stringify(res.send.mock.calls)).not.toContain('database detail');
      expect(next).toHaveBeenCalledTimes(1);
    }
  );
});
