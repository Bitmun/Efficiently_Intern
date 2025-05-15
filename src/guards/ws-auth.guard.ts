import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtTokenPayload } from 'src/auth/type';
import { WsOnConnectContext } from 'src/types/contextTypes';
import { extractAccessToken } from 'src/utils/cookiesParser';

export const OnConnectGuard = async (ctx: any): Promise<void> => {
  const typedCtx = ctx as WsOnConnectContext;

  const { extra } = typedCtx;

  const { cookie } = typedCtx.extra.request.headers;

  if (!cookie) {
    throw new BadRequestException('No cookies for auth');
  }

  const accessToken = extractAccessToken(cookie);

  if (!accessToken) {
    throw new UnauthorizedException('Token not provided');
  }

  const jwtService = new JwtService({ secret: 'secret' });

  try {
    const payload: JwtTokenPayload = await jwtService.verifyAsync(accessToken, {
      secret: 'secret',
    });
    extra.user = payload;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
};
