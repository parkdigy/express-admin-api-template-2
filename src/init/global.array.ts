declare global {
  interface Array<T> {
    /**
     * 배열을 주어진 크기로 나눕니다.
     * @param chunk 나눌 크기
     * @returns 나누어진 배열
     */
    split(chunk: number): Array<Array<T>>;
  }
}

/********************************************************************************************************************
 * split
 * ******************************************************************************************************************/
if (!Array.prototype.split) {
  Array.prototype.split = function (chunk) {
    const result = [];
    for (let index = 0; index < this.length; index += chunk) {
      result.push(this.slice(index, index + chunk));
    }
    return result;
  };
}

export {};
