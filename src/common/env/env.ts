/********************************************************************************************************************
 * ENV 모듈
 * ******************************************************************************************************************/

const appEnv = process.env.APP_ENV;
const isLocal = process.env.APP_ENV === 'local';
const isNotLocal = process.env.APP_ENV !== 'local';
const isDevelopment = process.env.APP_ENV === 'development';
const isNotDevelopment = process.env.APP_ENV !== 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isNotStaging = process.env.APP_ENV !== 'staging';
const isProduction = process.env.APP_ENV === 'production';
const isNotProduction = process.env.APP_ENV !== 'production';
const title = process.env.APP_NAME;

const env = {
  $$routerCount: 0,
  env: appEnv,
  isLocal,
  isNotLocal,
  isDevelopment,
  isNotDevelopment,
  isStaging,
  isNotStaging,
  isProduction,
  isNotProduction,
  title,
};

export default env;
