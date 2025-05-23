import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  public onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  public async get(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }

  public async set(prefix: string, key: string, value: string): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value);
  }

  public async delete(prefix: string, key: string): Promise<void> {
    await this.redisClient.del(`${prefix}:${key}`);
  }

  public async lpush(
    prefix: string,
    key: string,
    value: string[] | number[],
  ): Promise<void> {
    await this.redisClient.lpush(`${prefix}:${key}`, ...value);
  }

  public async lrange(
    prefix: string,
    key: string,
    start: number,
    end: number,
  ): Promise<string[]> {
    return this.redisClient.lrange(`${prefix}:${key}`, start, end);
  }

  public async setWithExpiry(
    prefix: string,
    key: string,
    value: string,
    expiry: number,
  ): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }
}
