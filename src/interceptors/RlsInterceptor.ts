/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';
import { AuthContext } from 'src/types/contextTypes';
import { EntityManager } from 'typeorm';

@Injectable()
export class RlsInterceptor implements NestInterceptor {
  constructor(private readonly entityManager: EntityManager) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context).getContext() as AuthContext;

    const { user } = ctx.req;

    if (!user) {
      throw new BadRequestException('User not provided');
    }

    const { id } = user;

    if (!id) {
      throw new BadRequestException('No id in user in context');
    }

    await this.entityManager.query(
      `SELECT set_config('request.userId', '${id}', false);`,
    );

    return next.handle();
  }
}
