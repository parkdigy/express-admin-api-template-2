import { type ApiData, type ApiPaging, type ApiResponse, ApiError } from './api.types';

type ApiMsg =
  | string
  | {
      text: string;
      html?: string;
      replace?: Record<string, string | number>;
    };

type ApiFinalMsg = {
  text: string;
  html?: string;
};

const Error = {
  Exception: new ApiError(500, 99999, '예상치 못한 오류가 발생했습니다.'),
  Parameter: new ApiError(400, 99998, '파라메터 정보가 유효하지 않습니다.'),
  Unauthorized: new ApiError(401, 99997),
  Permission: new ApiError(403, 99996, '사용 권한이 없습니다'),
  NoDataChanged: new ApiError(400, 99995, '변경된 정보가 없습니다.'),
};

function getReplacedMsg(msg?: ApiMsg): ApiFinalMsg | undefined {
  if (notEmpty(msg)) {
    if (typeof msg === 'string') {
      return { text: msg };
    } else if (typeof msg === 'object') {
      let finalTextMsg = msg.text;
      let finalHtmlMsg = msg.html;
      const replace = msg.replace;

      if (replace) {
        for (const key in replace) {
          if (Object.prototype.hasOwnProperty.call(replace, key)) {
            const searchKey = `:${key}`;
            while (finalTextMsg.indexOf(searchKey) !== -1) {
              finalTextMsg = finalTextMsg.replace(searchKey, replace[key].toString());
            }
            if (finalHtmlMsg) {
              while (finalHtmlMsg.indexOf(searchKey) !== -1) {
                finalHtmlMsg = finalHtmlMsg.replace(searchKey, replace[key].toString());
              }
            }
          }
        }
      }

      return { text: finalTextMsg, html: finalHtmlMsg };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

const api = {
  Error,

  /** 오류 생성 */
  newApiError(status: number, code: number, msg?: ApiFinalMsg) {
    return new ApiError(status, code, msg?.text, msg?.html);
  },

  /**
   * 신규 오류 생성 (기존 오류에서 복사)
   */
  newError(error: ApiError, msg?: ApiMsg) {
    const replacedMsg = getReplacedMsg(msg);
    return new ApiError(error.getStatus(), error.getCode(), replacedMsg?.text, replacedMsg?.html);
  },

  /**
   * 신규 오류 생성 (기존 오류의 메시지 치환)
   */
  newErrorReplaceMsg(error: ApiError, replace: Record<string, string | number>) {
    const originalMsg: ApiMsg = {
      text: error.getMsg() ?? '',
      html: error.getHtmlMsg(),
      replace,
    };
    const replacedMsg = getReplacedMsg(originalMsg);
    return new ApiError(error.getStatus(), error.getCode(), replacedMsg?.text, replacedMsg?.html);
  },

  /**
   * 신규 Exception 오류 생성 (기존 오류에서 복사)
   */
  newExceptionError(msg?: ApiMsg) {
    const replacedMsg = getReplacedMsg(msg);
    const error = this.Error.Exception;
    return new ApiError(
      error.getStatus(),
      error.getCode(),
      ifUndefined(replacedMsg?.text, error.getMsg()),
      replacedMsg?.html
    );
  },

  /**
   * 성공 전송
   */
  success(res: MyResponse, data?: ApiData, paging?: ApiPaging, redirect?: string, redirectOpenInNewWindow = false) {
    const responseData: ApiResponse = {
      result: { c: 0 },
      data,
      paging,
    };
    if (redirect) {
      responseData.result.r = redirect;
      responseData.result.ro = redirectOpenInNewWindow;
    }
    res.send(responseData);
  },

  /**
   * 성공 전송 (메시지 포함)
   */
  successMsg(res: MyResponse, msg: ApiMsg, data?: ApiData, redirect?: string, redirectOpenInNewWindow = false) {
    const sendData: ApiResponse = {
      result: { c: 0 },
      data,
    };
    const replacedMsg = getReplacedMsg(msg);
    if (replacedMsg) {
      if (replacedMsg?.text) sendData.result.m = replacedMsg.text;
      if (replacedMsg?.html) sendData.result.hm = replacedMsg.html;
    }
    if (redirect) {
      sendData.result.r = redirect;
      sendData.result.ro = redirectOpenInNewWindow;
    }
    res.send(sendData);
  },

  /**
   * 오류 전송
   * 🚨 ApiController 미들웨어 내에서 사용 시 이 함수를 사용하지 말고, throwError(), throwException() 함수를 사용해야 함 🚨
   * 🚨 ApiController 내에서 이 함수 사용 시 db 가 rollback 되지 않고, commit 됨 🚨
   */
  error(res: MyResponse, error: ApiError | Error) {
    if (error instanceof ApiError) {
      res.status(error.getStatus()).send({
        result: error.getResult(),
      });
    } else {
      res.status(Error.Exception.getStatus()).send(Error.Exception.getResult(error.toString()));
    }
  },
};

export default api;
