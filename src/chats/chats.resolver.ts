import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Chat } from './models/chat.model';
import { ChatsService } from './chats.service';

import { ChatMember } from 'src/chat-members/model/chat-member.model';
import { AuthGuard } from 'src/guards/auth.guard';
import { Message } from 'src/messages/models/message.model';
import { AuthContext } from 'src/types/contextTypes';

@UseGuards(AuthGuard)
@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @Query(() => [Chat])
  public async findAllChats(): Promise<Chat[]> {
    return await this.chatsService.findAll();
  }

  @Query(() => [Message])
  public async getChatsMessages(
    @Args('chatId') chatId: string,
    @Args('limit') limit: number,
    @Args('offset') offset: number,
  ): Promise<Message[]> {
    return this.chatsService.getChatsMessages(chatId, limit, offset);
  }

  @Query(() => [ChatMember])
  public async findAllChatsMembers(
    @Args('chatId') chatId: string,
  ): Promise<ChatMember[]> {
    return await this.chatsService.findChatsMembers(chatId);
  }

  @Mutation(() => Boolean)
  public async addUserToChat(
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    return await this.chatsService.addUserToChat(chatId, userId);
  }

  @Mutation(() => Message)
  public async sendMessageToChat(
    @Args('chatId') chatId: string,
    @Args('body') body: string,
    @Context() context: AuthContext,
  ): Promise<Message> {
    const { user } = context.req;
    return await this.chatsService.sendMessageToChat(chatId, user, body);
  }

  @Mutation(() => Boolean)
  public async removeUserFromChat(
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    return await this.chatsService.removeUserFromChat(chatId, userId);
  }

  @Mutation(() => Boolean)
  public async deleteChat(@Args('chatId') chatId: string): Promise<boolean> {
    return await this.chatsService.deleteById(chatId);
  }

  @Mutation(() => Boolean)
  public async deleteAllChats(): Promise<boolean> {
    return await this.chatsService.deleteAll();
  }
}
