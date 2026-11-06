import { type MyRequest as _MyRequest, type MyAuthRequest as _MyAuthRequest, type MyResponse as _MyResponse } from '@types';

declare global {
  type MyRequest = _MyRequest;
  type MyAuthRequest = _MyAuthRequest;
  type MyResponse = _MyResponse;
}

export {};
