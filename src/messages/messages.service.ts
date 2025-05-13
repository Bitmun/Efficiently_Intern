/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';

import { Model } from 'mongoose';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { ContextUser } from 'src/types/contextTypes';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private msgModel: Model<Message>) {}

  public async sendMessage(
    sendMsgDto: SendMessageDto,
    contextUser: ContextUser,
  ): Promise<Message> {
    const { id, login } = contextUser;
    const message = await this.msgModel.create({
      ...sendMsgDto,
      userId: id,
      userLogin: login,
    });

    const payload: MessageSendPayload = {
      messageSend: message,
    };

    pubSub.publish(MESSAGE_TRIGGERS.SEND_MESSAGE, payload);
    return message;
  }

  public async deleteMessage(messageId: string): Promise<Message> {
    const message = await this.msgModel.findByIdAndUpdate(
      messageId,
      { isDeleted: true, text: '[Deleted]' },
      { new: true },
    );

    if (!message) {
      throw new NotFoundException('No message to delete');
    }

    const payload: MessageDeletedPayload = {
      messageDeleted: message,
    };

    pubSub.publish(MESSAGE_TRIGGERS.DELETE_MESSAGE, payload);

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

  public async updateMessagesForRemovedUser(
    chatId: string,
    userId: string,
  ): Promise<any> {
    return this.msgModel.updateMany({ chatId, userId }, { login: '[Deleted User]' });
  }
}
