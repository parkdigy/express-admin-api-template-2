/********************************************************************************************************************
 * Cors 미들웨어
 * ******************************************************************************************************************/

import Cors, { type CorsOptions } from 'cors';

const corsWhiteList: string[] = [];

const defaultCorsOptions: CorsOptions = {
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
};

export default env.isLocal
  ? Cors({
      origin: true,
      ...defaultCorsOptions,
    })
  : Cors({
      origin: function (origin, callback) {
        if (origin && corsWhiteList.includes(origin)) {
          callback(null, origin);
        } else {
          callback(null);
        }
      },
      ...defaultCorsOptions,
    });
