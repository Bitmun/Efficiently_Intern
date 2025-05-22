import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { MessageDeletedPayload, MessageSendPayload } from './message-subs-payloads';
import { MESSAGE_TRIGGERS } from './message-subs-triggers';

import { Model, Types } from 'mongoose';
import { EventBridgeService } from 'src/aws/eventbridge/eventbridge.service';
import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { INDEXES_NAMES } from 'src/indexes/indexes-names';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { RedisService } from 'src/redis/redis.service';
import { ContextUser } from 'src/types/contextTypes';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private msgModel: Model<Message>,
    private readonly chatMemberService: ChatMembersService,
    private readonly redisService: RedisService,
    private readonly eventBridgeService: EventBridgeService,
  ) {}

  public async findAll(): Promise<Message[]> {
    return this.msgModel.find();
  }

  public findChatsLastMessages(
    chatId: Types.ObjectId | string,
    limit: number,
    _offset: number,
  ): Promise<Message[]> {
    const cachedMessages = this.redisService.findChatsLastMessages(
      chatId.toString(),
      limit,
    );
    return cachedMessages;
  }

  public async create(
    sendMsgDto: SendMessageDto,
    contextUser: ContextUser,
  ): Promise<Message> {
    const { id, login } = contextUser;
    const { body, chatId } = sendMsgDto;
    return await this.msgModel.create({
      userId: id,
      username: login,
      body,
      chatId: new Types.ObjectId(chatId),
    });
  }

  public async findChatsLastMessage(chatId: Types.ObjectId): Promise<Message | null> {
    return this.msgModel.findOne({ chatId }).sort({ createdAt: -1 }).limit(1);
  }

  public async sendMessage(
    sendMsgDto: SendMessageDto,
    contextUser: ContextUser,
  ): Promise<Message> {
    const { chatId } = sendMsgDto;

    const message = new this.msgModel({
      userId: contextUser.id,
      username: contextUser.login,
      body: sendMsgDto.body,
      chatId: new Types.ObjectId(chatId),
    });

    await this.redisService.sendMessageToChat(chatId, message);

    await this.eventBridgeService.publishMessageEvent(message);

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

  public async searchUsersProjectMessages(
    query: string,
    projectId: string,
    userId: string,
  ): Promise<Message[]> {
    const chatIds = await this.chatMemberService.findUsersProjectChats(userId, projectId);

    if (!chatIds.length) return [];

    return this.msgModel.aggregate([
      {
        $search: {
          index: INDEXES_NAMES.SEARCH_MSGS_ACROSS_CHATS,
          regex: {
            query: `(.*)${query}(.*)`,
            path: ['body'],
            allowAnalyzedField: true,
          },
        },
      },
      {
        $match: {
          chatId: { $in: chatIds },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
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

  public async deleteAllMessages(): Promise<boolean> {
    const res = await this.msgModel.deleteMany();
    return res.deletedCount > 0;
  }
}
