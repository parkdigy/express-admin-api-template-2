export interface ApiResult {
  c: number;
  m?: string; // msg
  hm?: string; // html msg
  e?: string; // additional error
  r?: string; // redirect
  ro?: boolean; // redirect - open new window
}

export type ApiData = Record<string, any> | Array<any> | string;

export interface ApiPaging {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse {
  result: ApiResult;
  data?: ApiData;
  paging?: ApiPaging;
}

export class ApiError {
  $status: number;
  $code: number;
  $msg?: string;
  $htmlMsg?: string;

  constructor(status = 500, code: number, msg?: string, htmlMsg?: string) {
    this.$code = code;
    this.$msg = msg;
    this.$htmlMsg = htmlMsg;
    this.$status = status;
  }

  getResult(additionalError?: string) {
    const result: ApiResult = { c: this.$code };
    if (notEmpty(this.$msg)) result.m = this.$msg;
    if (notEmpty(this.$htmlMsg)) result.hm = this.$htmlMsg;

    if (additionalError && env.isLocal) {
      result.e = additionalError;
    }

    return result;
  }

  getCode() {
    return this.$code;
  }

  getMsg() {
    return this.$msg;
  }

  getHtmlMsg() {
    return this.$htmlMsg;
  }

  getStatus() {
    return this.$status;
  }

  toString() {
    return `[HTTP-${this.$status}] (${this.$code}) ${this.$msg}`;
  }
}
