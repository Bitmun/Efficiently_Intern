import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Chat, ChatSchema } from './models/chat.module';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';

import { MessagesModule } from 'src/messages/messages.module';

@Module({
  providers: [ChatsResolver, ChatsService],
  exports: [ChatsService],
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
  ],
})
export class ChatsModule {}
