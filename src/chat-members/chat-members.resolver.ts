import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ChatMember } from './model/chat-member.model';
import { ChatMembersService } from './chat-members.service';

import { Types } from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthContext } from 'src/types/contextTypes';

@UseGuards(AuthGuard)
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

  @Query(() => [String])
  public async findUsersProjectChats(
    @Args('projectId') projectId: string,
    @Context() context: AuthContext,
  ): Promise<Types.ObjectId[]> {
    const { id } = context.req.user;
    return await this.chatMembersService.findUsersProjectChats(id, projectId);
  }

  @Mutation(() => Boolean)
  public async deleteAllMembersInfo(): Promise<boolean> {
    return await this.chatMembersService.deleteAllMembers();
  }
}
