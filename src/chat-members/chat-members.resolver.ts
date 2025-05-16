import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ChatMember } from './model/chat-member.model';
import { ChatMembersService } from './chat-members.service';

@Resolver(() => ChatMember)
export class ChatMembersResolver {
  constructor(private chatMembersService: ChatMembersService) {}

  @Query(() => [ChatMember])
  public async findAllChatsMembers(
    @Args('chatId') chatId: string,
  ): Promise<ChatMember[]> {
    return await this.chatMembersService.findAllChatMembers(chatId);
  }

  @Query(() => [ChatMember])
  public async findAllMembers(): Promise<ChatMember[]> {
    return await this.chatMembersService.findAllMembers();
  }

  @Mutation(() => Boolean)
  public async deleteAllMembersInfo(): Promise<boolean> {
    return await this.chatMembersService.deleteAllMembers();
  }
}
