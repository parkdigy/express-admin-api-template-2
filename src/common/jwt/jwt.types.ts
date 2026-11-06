import { type JwtPayload as _JwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends _JwtPayload {
  key: string;
}
