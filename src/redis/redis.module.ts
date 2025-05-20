import { Module } from '@nestjs/common';

import { RedisRepository } from './redis.repository';
import { RedisService } from './redis.service';
import { redisClientFactory } from './redisClientFactory';

@Module({
  imports: [],
  controllers: [],
  providers: [redisClientFactory, RedisRepository, RedisService],

  exports: [RedisService],
})
export class RedisModule {}
