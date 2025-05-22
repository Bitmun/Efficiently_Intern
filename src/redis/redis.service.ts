import { Inject, Injectable } from '@nestjs/common';

import { RedisRepository } from './redis.repository';
import { RedisPrefixEnum } from './redix.prefix.enum';

import { Types } from 'mongoose';
import { Message } from 'src/messages/models/message.model';

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

  public async sendMessageToChat(chatId: string, message: Message): Promise<void> {
    await this.redisRepository.lpush(RedisPrefixEnum.SEND_MESSAGE, chatId, [
      JSON.stringify(message),
    ]);
  }

  public async findChatsLastMessages(chatId: string, limit = 20): Promise<Message[]> {
    const rawMessages = await this.redisRepository.lrange(
      RedisPrefixEnum.SEND_MESSAGE,
      chatId,
      0,
      limit - 1,
    );
    return rawMessages.map((m) => JSON.parse(m) as Message);
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
