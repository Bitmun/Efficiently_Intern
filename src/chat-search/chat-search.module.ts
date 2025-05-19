import { Module } from '@nestjs/common';

import { ChatSearchResolver } from './chat-search.resolver';
import { ChatSearchService } from './chat-search.service';

import { ChatMembersModule } from 'src/chat-members/chat-members.module';
import { ChatsModule } from 'src/chats/chats.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  providers: [ChatSearchService, ChatSearchResolver],
  imports: [ChatsModule, MessagesModule, ChatMembersModule],
})
export class ChatSearchModule {}
