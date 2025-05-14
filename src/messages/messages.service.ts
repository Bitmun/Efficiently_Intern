import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { UnreadMessage } from './models/unread-message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';

import { Model } from 'mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { ContextUser } from 'src/types/contextTypes';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private msgModel: Model<Message>,
    @InjectModel(UnreadMessage.name) private unreadMsgModel: Model<UnreadMessage>,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

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

    const { chatId } = sendMsgDto;

    const chat = await this.chatsService.findById(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const unreadMsgEntries = chat.memberIds
      .filter((uid) => uid !== id)
      .map((uid) => ({
        messageId: message._id,
        chatId: chat._id,
        userId: uid,
      }));

    await this.unreadMsgModel.insertMany(unreadMsgEntries);

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

  public async updateMessagesForRemovedUser(
    chatId: string,
    userId: string,
  ): Promise<any> {
    return this.msgModel.updateMany({ chatId, userId }, { login: '[Deleted User]' });
  }

  public async markChatMessagesAsRead(chatId: string, userId: string): Promise<number> {
    const res = await this.unreadMsgModel.deleteMany({ chatId, userId });
    return res.deletedCount || 0;
  }

  public async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await this.unreadMsgModel.deleteOne({ messageId, userId });
  }

  public async getUnreadMessagesCount(chatId: string, userId: string): Promise<number> {
    const count = await this.unreadMsgModel.countDocuments({ chatId, userId });
    return count;
  }
}
