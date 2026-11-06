/********************************************************************************************************************
 * 로그 기록 미들웨어
 * - 민감정보와 개인정보는 재귀적으로 마스킹
 * - 문자열이 너무 길 경우 500자로 제한
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';
import logging from '@common_logging';

const $logging = process.env.LOGGING === 'true';

export default function (loggingData = false) {
  return (req: MyRequest, res: MyResponse, next: NextFunction) => {
    if ($logging) {
      try {
        const logText = `${req.$$remoteIpAddress} ${req.method} ${util.url.join(req.baseUrl, req.path)}`;
        if (loggingData) {
          const data = util.sanitize.sanitizeForLog({ ...req.params, ...req.query, ...req.body });

          logging.info(logText, data);
        } else {
          logging.info(logText);
        }
      } catch (err) {
        ll(err);
      }
    }

    next();
  };
}
