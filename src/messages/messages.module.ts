import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from './models/message.model';
import { UnreadMessage, UnreadMessageSchema } from './models/unread-message.model';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';

import { ChatsModule } from 'src/chats/chats.module';

@Module({
  providers: [MessagesResolver, MessagesService],
  exports: [MessagesService],
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: UnreadMessage.name, schema: UnreadMessageSchema },
    ]),
    forwardRef(() => ChatsModule),
  ],
})
export class MessagesModule {}
