import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';

import { Model } from 'mongoose';
import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { ContextUser } from 'src/types/contextTypes';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private msgModel: Model<Message>,
    private readonly chatMemberService: ChatMembersService,
  ) {}

  public async findAll(): Promise<Message[]> {
    return this.msgModel.find();
  }

  public async sendMessage(
    sendMsgDto: SendMessageDto,
    contextUser: ContextUser,
  ): Promise<Message> {
    const { id, login } = contextUser;
    const message = await this.msgModel.create({
      ...sendMsgDto,
      userId: id,
      username: login,
    });

    const payload: MessageSendPayload = {
      messageSend: message,
    };

    await pubSub.publish(MESSAGE_TRIGGERS.SEND_MESSAGE, payload);

    return message;
  }

  public async deleteMessage(messageId: string): Promise<Message> {
    const message = await this.msgModel.findByIdAndUpdate(
      messageId,
      { isDeleted: true, body: '[Deleted]' },
      { new: true },
    );

    if (!message) {
      throw new NotFoundException('No message to delete');
    }

    const payload: MessageDeletedPayload = {
      messageDeleted: message,
    };

    await pubSub.publish(MESSAGE_TRIGGERS.DELETE_MESSAGE, payload);

    return message;
  }

  public async searchMessagesInChat(chatId: string, query: string): Promise<any> {
    const messages = await this.msgModel.find({
      chatId,
      text: { $regex: query, $options: 'i' },
    });

    if (!messages) {
      throw new NotFoundException('Messages not found');
    }

    return messages;
  }

  public async markMessageAsRead(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    const member = await this.chatMemberService.findByIds(chatId, userId);

    if (!member) {
      throw new NotFoundException('Chat member not found');
    }

    member.lastReadMsgId = messageId;
    await member.save();
  }

  public async markChatAsRead(chatId: string, userId: string): Promise<void> {
    const lastMessage = await this.msgModel.findOne({ chatId }).sort({ createdAt: -1 });

    if (!lastMessage) return;

    await this.chatMemberService.updateLastMsg(chatId, userId, lastMessage._id);
  }

  public async countUnreadMessages(chatId: string, userId: string): Promise<number> {
    const member = await this.chatMemberService.findByIds(chatId, userId);
    if (!member) {
      throw new NotFoundException('Chat member not found');
    }

    const filter: { chatId: string; createdAt?: { $gt: Date } } = { chatId };
    if (member.lastReadMsgId) {
      const lastReadMessage = await this.msgModel.findById(member.lastReadMsgId);
      if (lastReadMessage) {
        filter.createdAt = { $gt: lastReadMessage.createdAt };
      }
    }

    return await this.msgModel.countDocuments(filter);
  }

  public async updateMessagesForRemovedUser(
    chatId: string,
    userId: string,
  ): Promise<any> {
    return this.msgModel.updateMany({ chatId, userId }, { login: '[Deleted User]' });
  }
}
