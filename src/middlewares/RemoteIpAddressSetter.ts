/********************************************************************************************************************
 * 클라이언트 IP 주소 설정 미들웨어
 * - req.$$remoteIpAddress 에 클라이언트 IP 주소 저장
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';

export default function (req: MyRequest, res: MyResponse, next: NextFunction) {
  const forwardedVal = req.headers['x-forwarded-for'];
  let forwarded: string | undefined;
  if (Array.isArray(forwardedVal)) {
    forwarded = forwardedVal[0];
  } else {
    forwarded = forwardedVal;
  }

  let remoteIpAddress = forwarded || req.socket.remoteAddress;
  if (notEmpty(remoteIpAddress)) {
    if (remoteIpAddress.includes(',')) {
      remoteIpAddress = remoteIpAddress.split(',')[0];
    }
    remoteIpAddress = remoteIpAddress.replace(/::ffff:/g, '');
    if (remoteIpAddress === '::1') {
      remoteIpAddress = '127.0.0.1';
    }
  }

  req.$$remoteIpAddress = remoteIpAddress;

  next();
}
