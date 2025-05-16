import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './models/chat.model';
import { ChatsService } from './chats.service';

import { AuthGuard } from 'src/guards/auth.guard';
import { AuthContext } from 'src/types/contextTypes';

@UseGuards(AuthGuard)
@Resolver(() => Chat)
export class ChatsResolver {
  constructor(private chatsService: ChatsService) {}

  @Query(() => [Chat])
  public async findAllChats(): Promise<Chat[]> {
    return await this.chatsService.findAll();
  }

  @Mutation(() => Chat)
  public async createChat(
    @Args('input', { type: () => CreateChatDto }) input: CreateChatDto,
    @Context() context: AuthContext,
  ): Promise<Chat> {
    const { projectId, memberIds, subject } = input;

    const { id } = context.req.user;

    const members = [id, ...(memberIds || [])];
    return await this.chatsService.create(projectId, members, subject);
  }

  @Mutation(() => Boolean)
  public async addUserToChat(
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ): Promise<boolean> {
    return await this.chatsService.addUserToChat(chatId, userId);
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
}
