import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from './models/message.model';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

import { ChatMembersModule } from 'src/chat-members/chat-members.module';

@Module({
  providers: [MessagesResolver, MessagesService],
  exports: [MessagesService],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatMembersModule,
  ],
})
export class MessagesModule {}
