import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ChatMemberInfo } from './model/chat-member-info.model';
import { ChatMemberInfoService } from './chat-member-info.service';

@Resolver(() => ChatMemberInfo)
export class ChatMemberInfoResolver {
  constructor(private chatMembersService: ChatMemberInfoService) {}

  @Query(() => [ChatMemberInfo])
  public async findAllChatsMembers(
    @Args('chatId') chatId: string,
  ): Promise<ChatMemberInfo[]> {
    return await this.chatMembersService.findAllChatMembers(chatId);
  }

  @Query(() => [ChatMemberInfo])
  public async findAllMembers(): Promise<ChatMemberInfo[]> {
    return await this.chatMembersService.findAllMembers();
  }

  @Mutation(() => Boolean)
  public async deleteAllMembersInfo(): Promise<boolean> {
    return await this.chatMembersService.deleteAllMembers();
  }
}
