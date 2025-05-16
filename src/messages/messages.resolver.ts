/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import { DeleteMessageDto } from './dto/delete-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';
import { MessagesService } from './messages.service';

import { AuthGuard } from 'src/guards/auth.guard';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { AuthContext } from 'src/types/contextTypes';
@UseGuards(AuthGuard)
@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly msgService: MessagesService) {}

  @Query(() => Number)
  public async countUnreadMessages(
    @Args('chatId') chatId: string,
    @Context() context: AuthContext,
  ): Promise<number> {
    const { user } = context.req;

    return await this.msgService.countUnreadMessages(chatId, user.id);
  }

  @Query(() => [Message])
  public async findAllMessages(): Promise<Message[]> {
    return await this.msgService.findAll();
  }

  @Mutation(() => Message)
  public async sendMessage(
    @Args('input') input: SendMessageDto,
    @Context() context: AuthContext,
  ): Promise<Message> {
    const { user } = context.req;
    return await this.msgService.sendMessage(input, user);
  }

  @Mutation(() => Message)
  public async deleteMessage(@Args('input') input: DeleteMessageDto): Promise<Message> {
    return await this.msgService.deleteMessage(input.messageId);
  }

  @Mutation(() => Boolean)
  public async markMessageAsRead(
    @Args('chatId') chatId: string,
    @Args('messageId') messageId: string,
    @Context() context: AuthContext,
  ): Promise<boolean> {
    const { user } = context.req;
    await this.msgService.markMessageAsRead(chatId, user.id, messageId);
    return true;
  }

  @Mutation(() => Boolean)
  public async markChatAsRead(
    @Args('chatId') chatId: string,
    @Context() context: AuthContext,
  ): Promise<boolean> {
    const { user } = context.req;
    await this.msgService.markChatAsRead(chatId, user.id);
    return true;
  }

  @Subscription(() => Message, {
    filter: (payload: MessageSendPayload, variables) => {
      return payload.messageSend.chatId === variables.chatId;
    },
  })
  public messageSend(@Args('chatId') _chatId: string): any {
    return pubSub.asyncIterableIterator(MESSAGE_TRIGGERS.SEND_MESSAGE);
  }

  @Subscription(() => Message, {
    filter: (payload: MessageDeletedPayload, variables) =>
      payload.messageDeleted.chatId === variables.chatId,
  })
  public messageDeleted(@Args('chatId') _chatId: string): any {
    return pubSub.asyncIterableIterator(MESSAGE_TRIGGERS.DELETE_MESSAGE);
  }
}
