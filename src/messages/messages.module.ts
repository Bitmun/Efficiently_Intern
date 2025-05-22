import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from './models/message.model';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

import { AwsModule } from 'src/aws/aws.module';
import { ChatMembersModule } from 'src/chat-members/chat-members.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  providers: [MessagesResolver, MessagesService],
  exports: [MessagesService],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatMembersModule,
    RedisModule,
    AwsModule,
  ],
})
export class MessagesModule {}
