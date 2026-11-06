import Controller from '../../src/middlewares/Controller';
import { type MyRequest, type MyResponse } from '../../src/@types';
import { db as _db } from '../../src/db';
import '../../src/init/global.error';

declare global {
  var db: typeof _db;
}
describe('Controller error response', () => {
  it('logs the internal error and returns only a standardized response', async () => {
    const internalError = new Error('SQL failed password=database-secret');
    globalThis.db = {
      trans: {
        commitAll: jest.fn(),
        rollbackAll: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as typeof _db;
    globalThis.printError = jest.fn();

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

    await (middlewares[1] as any)({} as MyRequest, res as unknown as MyResponse, next);

    expect(globalThis.printError).toHaveBeenCalledWith(expect.anything(), internalError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      result: { c: -1, m: '요청 처리 중 오류가 발생했습니다.' },
    });
    expect(JSON.stringify(res.send.mock.calls)).not.toContain('database-secret');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('still returns the standardized response when rollback fails', async () => {
    globalThis.db = {
      trans: {
        commitAll: jest.fn(),
        rollbackAll: jest.fn().mockRejectedValue(new Error('rollback database detail')),
      },
    } as unknown as typeof _db;
    globalThis.printError = jest.fn();
    const res = {
      headersSent: false,
      status: jest.fn(),
      send: jest.fn(),
    };
    res.status.mockReturnValue(res);
    res.send.mockReturnValue(res);
    const middlewares = Controller(async () => {
      throw new Error('controller detail');
    });

    await (middlewares[1] as any)({} as MyRequest, res as unknown as MyResponse, jest.fn());

    expect(globalThis.printError).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      result: { c: -1, m: '요청 처리 중 오류가 발생했습니다.' },
    });
  });
});
