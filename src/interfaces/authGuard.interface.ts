import { JwtService } from '@nestjs/jwt';

export interface AuthGuardInterface {
  getAccessToken: (cookie: string) => string;
  extractCookies: (headers: { cookie: string }) => string;
  verifyToken: (jwtService: JwtService, accessToken: string) => Promise<any>;
}
