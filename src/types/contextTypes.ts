import { Request } from 'express';
import { JwtTokenPayload } from 'src/auth/type';

export interface AuthContext {
  req: Request & { user: ContextUser };
}

export type ContextUser = JwtTokenPayload;

export interface WsOnConnectContext {
  extra: {
    user: ContextUser;
    request: {
      headers: {
        cookie: string;
      };
    };
  };
}
