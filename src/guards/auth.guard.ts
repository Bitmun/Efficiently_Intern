/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Context, GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

import { AuthContext } from 'src/types/contextTypes';
import { extractAccessToken } from 'src/utils/cookiesParser';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  public async canActivate(@Context() context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext() as AuthContext;

    const { cookie } = ctx.req.headers;

    if (!cookie) {
      throw new BadRequestException('No cookies for auth');
    }

    const accessToken = extractAccessToken(cookie);

    if (!accessToken) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: 'secret',
      });
      ctx.req['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
