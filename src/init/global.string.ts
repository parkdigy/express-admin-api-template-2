declare global {
  interface String {
    /**
     * 문자열을 주어진 문자열로 치환합니다.
     * @param replace 치환할 문자열 Object
     * @returns 치환된 문자열
     */
    replaceBatch(replace: { [key: string]: () => string }): string;
  }
}

/********************************************************************************************************************
 * replaceBatch
 * ******************************************************************************************************************/
if (!String.prototype.replaceBatch) {
  String.prototype.replaceBatch = function (replace) {
    let text = `${this}`;
    Object.keys(replace).forEach((key) => {
      const getValue = replace[key];
      if (text.includes(key)) {
        text = text.replaceAll(key, getValue());
      }
    });
    return text;
  };
}

export {};
