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
    await this.redisRepository.expire(RedisPrefixEnum.SEND_MESSAGE, chatId, 60);
  }

  public async setLastSyncDate(newDate: Date): Promise<void> {
    await this.redisRepository.set(
      RedisPrefixEnum.LAST_SYNC,
      RedisPrefixEnum.LAST_SYNC,
      newDate.toISOString(),
    );
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

  public async findAllActiveChats(limit = 20): Promise<Message[]> {
    const keys = await this.redisRepository.scanKeysByPrefix(
      RedisPrefixEnum.SEND_MESSAGE,
    );

    const result: Message[] = [];

    for (const fullKey of keys) {
      const chatId = fullKey.split(':')[1];
      const rawMessages = await this.redisRepository.lrange(
        RedisPrefixEnum.SEND_MESSAGE,
        chatId,
        0,
        limit - 1,
      );
      const messages = rawMessages.map((m) => JSON.parse(m) as Message);
      result.push(...messages);
    }

    return result;
  }

  public async getLastMsgsSync(): Promise<Date> {
    const lastSyncDate = await this.redisRepository.get(
      RedisPrefixEnum.LAST_SYNC,
      RedisPrefixEnum.LAST_SYNC,
    );
    return lastSyncDate ? new Date(lastSyncDate) : new Date(Date.now() - 5000);
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

  public async flushAll(): Promise<void> {
    return this.redisRepository.flushAll();
  }
}
