import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from './models/message.model';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

import { ChatMemberInfoModule } from 'src/chat-member-info/chat-member-info.module';

@Module({
  providers: [MessagesResolver, MessagesService],
  exports: [MessagesService],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatMemberInfoModule,
  ],
})
export class MessagesModule {}
