import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { Message } from 'src/messages/models/message.model';
import {
  ChatsSearchRes,
  GlobalProjectSearchRes,
  MsgsSearchRes,
} from 'src/types/searchTypes';

@Injectable()
export class ChatSearchService {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
  ) {}

  public async globalProjectSearch(
    query: string,
    projectId: string,
    userId: string,
  ): Promise<GlobalProjectSearchRes> {
    const chats = await this.chatsService.searchProjectChats(query, projectId);

    const chatsSearchRes: ChatsSearchRes[] = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.messagesService.findChatsLastMessage(chat._id);
        return {
          chat,
          lastMessage,
        };
      }),
    );

    const messages = await this.messagesService.searchUsersProjectMessages(
      query,
      projectId,
      userId,
    );

    const chatMap = new Map<string, Message[]>();

    for (const msg of messages) {
      if (!chatMap.has(msg.chatId.toString())) {
        chatMap.set(msg.chatId.toString(), []);
      }
      chatMap.get(msg.chatId.toString())!.push(msg);
    }

    const msgsSearchResult: MsgsSearchRes[] = [];

    for (const [chatId, foundChatMessages] of chatMap.entries()) {
      const chat = await this.chatsService.findById(new Types.ObjectId(chatId));
      if (chat) {
        msgsSearchResult.push({ chat, foundChatMessages });
      }
    }

    return { chatsSearchRes, msgsSearchResult };
  }
}
