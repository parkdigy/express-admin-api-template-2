import crypto from 'crypto';
import { exec } from 'child_process';
import Deploy from '../../../src/controllers/Deploy/Deploy';
import { type MyRequest, type MyResponse } from '../../../src/@types';
import '../../../src/init/global.log';

jest.mock('child_process', () => ({ exec: jest.fn() }));

const mockedExec = exec as unknown as jest.Mock;

function makeResponse() {
  const res = {
    status: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

function sign(body: Buffer, secret: string) {
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('Deploy.github', () => {
  const secret = 'test-deploy-secret';

  beforeEach(() => {
    process.env.DEPLOY_GITHUB_SECRET = secret;
    globalThis.ll = jest.fn();
    jest.clearAllMocks();
  });

  it('rejects a legacy SHA-1 signature', () => {
    const rawBody = Buffer.from('{"ref":"refs/heads/main"}');
    const req = {
      headers: { 'x-hub-signature': `sha1=${crypto.createHmac('sha1', secret).update(rawBody).digest('hex')}` },
      body: JSON.parse(rawBody.toString()),
      $$rawBody: rawBody,
    } as unknown as MyRequest;
    const res = makeResponse();

    Deploy.github(req, res as unknown as MyResponse);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ result: { c: -10, m: '배포 중 오류가 발생했습니다.' } });
    expect(mockedExec).not.toHaveBeenCalled();
  });

  it('verifies the exact raw body rather than re-serialized JSON', () => {
    const rawBody = Buffer.from('{ "zen": "keep it logically awesome" }');
    const req = {
      headers: {
        'x-hub-signature-256': sign(rawBody, secret),
        'x-github-event': 'ping',
      },
      body: JSON.parse(rawBody.toString()),
      $$rawBody: rawBody,
    } as unknown as MyRequest;
    const res = makeResponse();

    Deploy.github(req, res as unknown as MyResponse);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ result: { c: 1, m: 'skip' } });
    expect(mockedExec).not.toHaveBeenCalled();
  });

  it('does not expose command errors in the response', () => {
    const rawBody = Buffer.from('{"ref":"refs/heads/main","after":"commit"}');
    process.env.DEPLOY_GITHUB_REF = 'refs/heads/main';
    mockedExec.mockImplementationOnce((_command: string, callback: (err: Error) => void) => {
      callback(new Error('sensitive command output'));
    });
    const req = {
      headers: {
        'x-hub-signature-256': sign(rawBody, secret),
        'x-github-event': 'push',
      },
      body: JSON.parse(rawBody.toString()),
      $$rawBody: rawBody,
    } as unknown as MyRequest;
    const res = makeResponse();

    Deploy.github(req, res as unknown as MyResponse);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ result: { c: -12, m: '배포 중 오류가 발생했습니다.' } });
    expect(JSON.stringify(res.send.mock.calls)).not.toContain('sensitive command output');
  });

  it('returns git pull output in a successful response for deployment notification compatibility', () => {
    const rawBody = Buffer.from('{"ref":"refs/heads/main","after":"commit"}');
    const gitPullOutput = 'Updating previous..commit\nFast-forward\n';
    process.env.DEPLOY_GITHUB_REF = 'refs/heads/main';
    mockedExec
      .mockImplementationOnce(
        (_command: string, callback: (err: Error | null, stdout: string, stderr: string) => void) => {
          callback(null, gitPullOutput, '');
        }
      )
      .mockImplementationOnce(
        (_command: string, callback: (err: Error | null, stdout: string, stderr: string) => void) => {
          callback(null, 'commit\n', '');
        }
      )
      .mockImplementationOnce(() => undefined);
    const req = {
      headers: {
        'x-hub-signature-256': sign(rawBody, secret),
        'x-github-event': 'push',
      },
      body: JSON.parse(rawBody.toString()),
      $$rawBody: rawBody,
    } as unknown as MyRequest;
    const res = makeResponse();

    Deploy.github(req, res as unknown as MyResponse);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      result: { c: 0, m: '성공적으로 배포되었습니다.' },
      data: gitPullOutput,
    });
    expect(mockedExec).toHaveBeenNthCalledWith(3, 'npm run install:prod && npm run pm2:reload');
  });
});
