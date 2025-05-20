import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatMember, ChatMemberSchema } from './model/chat-member.model';
import { ChatMembersResolver } from './chat-members.resolver';
import { ChatMembersService } from './chat-members.service';

import { RedisModule } from 'src/redis/redis.module';

@Module({
  providers: [ChatMembersService, ChatMembersResolver],
  imports: [
    MongooseModule.forFeature([{ name: ChatMember.name, schema: ChatMemberSchema }]),
    RedisModule,
  ],
  exports: [ChatMembersService],
})
export class ChatMembersModule {}
