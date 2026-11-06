import { type Request } from 'express';

export interface MyRequestUser {
  id: number;
  email: string;
}

interface MyRequestCommon extends Request {
  $$remoteIpAddress?: string;
  $$rawBody?: Buffer;
}

export interface MyRequest extends MyRequestCommon {
  $$user?: MyRequestUser;
}

export interface MyAuthRequest extends MyRequestCommon {
  $$user: MyRequestUser;
}
