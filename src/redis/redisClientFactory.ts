import { FactoryProvider } from '@nestjs/common';

import { Redis } from 'ioredis';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisInstance = new Redis({
      host: 'localhost',
      port: 6379,
      password: 'password',
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    redisInstance.on('connect', () => {
      console.log('Redis connected');
    });

    return redisInstance;
  },
  inject: [],
};
