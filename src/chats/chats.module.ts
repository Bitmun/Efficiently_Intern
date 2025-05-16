import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Chat, ChatSchema } from './models/chat.model';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';

import { ChatMembersModule } from 'src/chat-members/chat-members.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  providers: [ChatsResolver, ChatsService],
  exports: [ChatsService],
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MessagesModule,
    ChatMembersModule,
  ],
})
export class ChatsModule {}
