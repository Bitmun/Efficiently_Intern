/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Context, GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

import { IncomingHttpHeaders } from 'http';
import { JwtTokenPayload } from 'src/auth/type';
import { AuthGuardInterface } from 'src/interfaces/authGuard.interface';
import { AuthContext } from 'src/types/contextTypes';
import { extractAccessToken } from 'src/utils/cookiesParser';

@Injectable()
export class AuthGuard implements CanActivate, AuthGuardInterface {
  constructor(private jwtService: JwtService) {}

  public getAccessToken(cookie: string): string {
    const accessToken = extractAccessToken(cookie);

    if (!accessToken) {
      throw new UnauthorizedException('Token not provided');
    }

    return accessToken;
  }

  public extractCookies(headers: IncomingHttpHeaders): string {
    const { cookie } = headers;

    if (!cookie) {
      throw new BadRequestException('No cookies for auth');
    }

    return cookie;
  }

  public async verifyToken(
    jwtService: JwtService,
    accessToken: string,
  ): Promise<JwtTokenPayload> {
    try {
      const payload: JwtTokenPayload = await jwtService.verifyAsync(accessToken, {
        secret: 'secret',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async canActivate(@Context() context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext() as AuthContext;

    const cookie = this.extractCookies(ctx.req.headers);

    const accessToken = this.getAccessToken(cookie);

    const payload = await this.verifyToken(this.jwtService, accessToken);

    ctx.req['user'] = payload;

    return true;
  }
}
