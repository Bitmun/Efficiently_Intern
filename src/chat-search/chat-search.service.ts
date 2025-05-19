import { Injectable } from '@nestjs/common';

import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { GlobalProjectSearchRes } from 'src/types/searchTypes';

@Injectable()
export class ChatSearchService {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly chatMembersService: ChatMembersService,
  ) {}

  public async globalProjectSearch(
    query: string,
    projectId: string,
    userId: string,
  ): Promise<GlobalProjectSearchRes> {
    const chats = await this.chatsService.searchProjectChats(query, projectId);
    const messages = await this.messagesService.searchUsersProjectMessages(
      query,
      projectId,
      userId,
    );
    return { chats, messages };
  }
}
