declare global {
  /**
   * 파라메터 정보가 유효하지 않음 Error 객체를 반환합니다.
   * @param name 파라메터 이름
   * @returns 에러 객체
   */
  function paramError(name?: string): Error;

  /**
   * 오류를 출력합니다.
   * @Param req MyRequest 객체
   * @param err 오류 값
   */
  function printError(req: MyRequest, err: unknown): void;
}

/********************************************************************************************************************
 * parseError
 * ******************************************************************************************************************/
globalThis.paramError = (name?: string) => {
  if (name != null) {
    return new Error(`'${name}' 파라메터 정보가 유효하지 않습니다.`);
  } else {
    return new Error('파라메터 정보가 유효하지 않습니다.');
  }
};

/********************************************************************************************************************
 * printError
 * ******************************************************************************************************************/
globalThis.printError = (req: MyRequest, err: unknown) => {
  ll('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  ll('🚨', `[${req.method}]`, `${req.baseUrl}${req.path}`);
  const data = util.sanitize.sanitizeForLog({ ...req.params, ...req.query, ...req.body }, 1000);
  if (typeof data === 'object') {
    ll('🚨', JSON.stringify(data, null, 2).trim().replaceAll('\n', '\n🚨 '));
  } else {
    ll('', `🚨 ${data}`.replaceAll('\n', '\n🚨 '));
  }
  if (err instanceof Error) {
    ll('🚨', util.sanitize.sanitizeLogText(err.stack || `${err.name}: ${err.message}`, 1000).replaceAll('\n', '\n🚨'));
  } else {
    const sanitizedErr = util.sanitize.sanitizeForLog(err, 1000);
    if (typeof sanitizedErr === 'object') {
      ll('🚨', `${JSON.stringify(sanitizedErr, null, 2).trim()}`.replaceAll('\n', '\n🚨 '));
    } else {
      ll('🚨', `${sanitizedErr}`.replaceAll('\n', '\n🚨 '));
    }
  }
  ll('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
};

export {};
