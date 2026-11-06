/********************************************************************************************************************
 * 배포 Controller
 * ******************************************************************************************************************/

import { exec } from 'child_process';
import crypto from 'crypto';

export default {
  /********************************************************************************************************************
   * github
   * ******************************************************************************************************************/
  github(req: MyRequest, res: MyResponse) {
    // 성공 응답
    const sendSuccess = (data: string) => {
      res.status(200).send({
        result: {
          c: 0,
          m: '성공적으로 배포되었습니다.',
        },
        data,
      });
    };

    // skip 응답
    const sendSkip = () => {
      res.status(200).send({
        result: {
          c: 1,
          m: 'skip',
        },
      });
    };

    // 실패 응답
    const sendFail = (code: number, status = 500) => {
      res.status(status).send({
        result: {
          c: code,
          m: '배포 중 오류가 발생했습니다.',
        },
      });
    };

    try {
      // 서명 확인
      const githubSignature = req.headers['x-hub-signature-256'];
      const githubSecret = process.env.DEPLOY_GITHUB_SECRET;
      if (
        typeof githubSignature !== 'string' ||
        !/^sha256=[0-9a-f]{64}$/.test(githubSignature) ||
        !githubSecret ||
        !req.$$rawBody
      ) {
        sendFail(-10, 401);
        return;
      }

      // 서명 비교
      const computedSignature = `sha256=${crypto.createHmac('sha256', githubSecret).update(req.$$rawBody).digest('hex')}`;
      const signatureBuffer = Buffer.from(githubSignature);
      const computedSignatureBuffer = Buffer.from(computedSignature);
      if (
        signatureBuffer.length !== computedSignatureBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, computedSignatureBuffer)
      ) {
        sendFail(-11, 401);
        return;
      }

      // push 이벤트인지 확인
      const githubEvent = req.headers['x-github-event'];
      if (githubEvent !== 'push') {
        sendSkip();
        return;
      }

      // 브랜치 일치하는지 확인
      const githubRef = req.body.ref;
      if (githubRef !== process.env.DEPLOY_GITHUB_REF) {
        sendSkip();
        return;
      }

      // git pull 실행
      exec('git pull 2>&1', (err, data, stderr) => {
        if (err) {
          ll('Deploy.github git pull failed', err);
          sendFail(-12);
        } else if (stderr) {
          ll('Deploy.github git pull stderr', stderr);
          sendFail(-13);
        } else if (['error', 'fatal'].includes(data.substring(0, 5))) {
          ll('Deploy.github git pull output error', data);
          sendFail(-14);
        } else {
          exec('git rev-parse HEAD', (err2, stdout2, stderr2) => {
            if (err2) {
              ll('Deploy.github git rev-parse failed', err2);
              sendFail(-15);
            } else if (stderr2) {
              ll('Deploy.github git rev-parse stderr', stderr2);
              sendFail(-16);
            } else {
              if (req.body.after.trim() === stdout2.replace(/\n/g, '').trim()) {
                sendSuccess(data);

                const checkText = 'Already up to date.';
                if (data.substring(0, checkText.length) !== checkText) {
                  // npm install 및 pm2 reload 실행
                  exec('npm run install:prod && npm run pm2:reload');
                }
              } else {
                ll('Deploy.github commit mismatch');
                sendFail(-17);
              }
            }
          });
        }
      });
    } catch {
      sendFail(-99);
    }
  },
};
