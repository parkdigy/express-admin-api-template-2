declare global {
  /**
   * 로그를 출력합니다.
   * @param message
   * @param optionalParams
   */
  function ll(message?: any, ...optionalParams: any[]): void;
}

/********************************************************************************************************************
 * ll
 * ******************************************************************************************************************/
globalThis.ll = function (message?: any, ...optionalParams: any[]) {
  console.log(message, ...optionalParams);
};

export {};
