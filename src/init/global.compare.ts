declare global {
  /**
   * 값이 클래스인지 확인합니다.
   * @param obj 확인할 값
   * @returns 값이 클래스이면 true, 그렇지 않으면 false를 반환합니다.
   */
  function isClass(obj: any): boolean;
}

/********************************************************************************************************************
 * isClass
 * ******************************************************************************************************************/
globalThis.isClass = (obj) => {
  if (!obj) return false;

  const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === 'class';
  if (obj.prototype === undefined) {
    return isCtorClass;
  }

  const isPrototypeCtorClass =
    obj.prototype.constructor &&
    obj.prototype.constructor.toString &&
    obj.prototype.constructor.toString().substring(0, 5) === 'class';
  return isCtorClass || isPrototypeCtorClass;
};

export {};
