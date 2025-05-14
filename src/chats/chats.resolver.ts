import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './models/chat.module';
import { ChatsService } from './chats.service';

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
  ): Promise<Chat> {
    const { projectId, memberIds, subject } = input;
    return await this.chatsService.create(projectId, memberIds, subject);
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
}
