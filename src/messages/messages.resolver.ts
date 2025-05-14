/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import { DeleteMessageDto } from './dto/delete-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';
import { MessagesService } from './messages.service';

import { pubSub } from 'src/pubsub/pubsub.provider';

const user = {
  id: '50495464-66ab-4808-844a-9d6d32f87292',
  login: 'login1',
};

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly msgService: MessagesService) {}

  @Query(() => Number)
  public async unreadMessagesCount(@Args('chatId') chatId: string): Promise<number> {
    return await this.msgService.getUnreadMessagesCount(chatId, user.id);
  }

  @Mutation(() => Number)
  public async markAllMessagesAsRead(@Args('chatId') chatId: string): Promise<number> {
    return await this.msgService.markChatMessagesAsRead(chatId, user.id);
  }

  @Mutation(() => Message)
  public async readMessage(@Args('messageId') messageId: string): Promise<void> {
    return await this.msgService.markMessageAsRead(messageId, user.id);
  }

  @Mutation(() => Message)
  public async sendMessage(@Args('input') input: SendMessageDto): Promise<Message> {
    return await this.msgService.sendMessage(input, user);
  }

  @Mutation(() => Message)
  public async deleteMessage(@Args('input') input: DeleteMessageDto): Promise<Message> {
    return await this.msgService.deleteMessage(input.messageId);
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
