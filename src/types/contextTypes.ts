import { Request } from 'express';
import { JwtTokenPayload } from 'src/auth/type';

export interface AuthContext {
  req: Request & { user: ContextUser };
}

export type ContextUser = JwtTokenPayload;
