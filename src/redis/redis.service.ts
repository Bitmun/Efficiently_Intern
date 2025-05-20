import { Inject, Injectable } from '@nestjs/common';

import { RedisRepository } from './redis.repository';
import { RedisPrefixEnum } from './redix.prefix.enum';

import { Types } from 'mongoose';

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}

  public async saveUsersProjectChats(
    userId: string,
    projectId: string,
    chats: Types.ObjectId[],
  ): Promise<void> {
    await this.redisRepository.set(
      RedisPrefixEnum.USERS_PROJECT_CHATS,
      userId + ':' + projectId,
      JSON.stringify(chats),
    );
  }

  public async getUsersProjectChats(
    userId: string,
    projectId: string,
  ): Promise<string[] | null> {
    const chats = await this.redisRepository.get(
      RedisPrefixEnum.USERS_PROJECT_CHATS,
      userId + ':' + projectId,
    );
    return chats ? (JSON.parse(chats) as string[]) : null;
  }
}
