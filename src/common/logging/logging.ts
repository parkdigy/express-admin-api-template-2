/********************************************************************************************************************
 * 로깅 모듈
 * ******************************************************************************************************************/

/** 로그 기록 디렉토리 */
const logDir = '@logs';

import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/error`,
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

/** 데이터를 로그에 기록하기 위한 텍스트로 변환 */
function dataLogValue(data?: any) {
  if (notEmpty(data)) {
    if (typeof data === 'object') {
      return ` ${JSON.stringify(data)}`;
    } else {
      return ` ${data.toString()}`;
    }
  } else {
    return '';
  }
}

const logging = {
  /********************************************************************************************************************
   * 정보 로그 기록
   * ******************************************************************************************************************/
  info(text: string, data?: any) {
    logger.info(`${text}${dataLogValue(data)}`);
  },
  /********************************************************************************************************************
   * 경고 로그 기록
   * ******************************************************************************************************************/
  warn(text: string, data?: any) {
    logger.warn(`${text}${dataLogValue(data)}`);
  },
  /********************************************************************************************************************
   * 경고 로그 기록
   * ******************************************************************************************************************/
  warning(text: string, data?: any) {
    logger.warn(`${text}${dataLogValue(data)}`);
  },
  /********************************************************************************************************************
   * 에러 로그 기록
   * ******************************************************************************************************************/
  err(text: string, data?: any) {
    if (env.isNotLocal) {
      util.slack.sendServerErrorAlarm([text, dataLogValue(data)]);
    }
    logger.error(`${text}${dataLogValue(data)}`);
  },
  /********************************************************************************************************************
   * 에러 로그 기록
   * ******************************************************************************************************************/
  error(text: string, data?: any) {
    if (env.isNotLocal) {
      util.slack.sendServerErrorAlarm([text, dataLogValue(data)]);
    }
    logger.error(`${text}${dataLogValue(data)}`);
  },
};

export default logging;
