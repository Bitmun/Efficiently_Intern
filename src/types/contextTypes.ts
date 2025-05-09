import { Request } from 'express';

export interface AuthContext {
  req: Request & { user: { login: string; id: string } };
}
