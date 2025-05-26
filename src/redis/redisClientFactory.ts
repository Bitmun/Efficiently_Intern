import { FactoryProvider } from '@nestjs/common';

import { Redis } from 'ioredis';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failesd: ${e}`);
    });

    redisInstance.on('connect', () => {
      console.log('Redis connected');
    });

    return redisInstance;
  },
  inject: [],
};
