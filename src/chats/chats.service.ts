import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Chat } from './models/chat.model';

import mongoose, { Model, Types } from 'mongoose';
import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { ChatMember } from 'src/chat-members/model/chat-member.model';
import { INDEXES_NAMES } from 'src/indexes/indexes-names';
import { MessageSendPayload } from 'src/messages/message-subs-payloads';
import { MESSAGE_TRIGGERS } from 'src/messages/message-subs-triggers';
import { MessagesService } from 'src/messages/messages.service';
import { Message } from 'src/messages/models/message.model';
import { pubSub } from 'src/pubsub/pubsub.provider';
import { RedisService } from 'src/redis/redis.service';
import { ContextUser } from 'src/types/contextTypes';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly msgService: MessagesService,
    private readonly chatMemberService: ChatMembersService,
    private readonly redisService: RedisService,
  ) {}

  public async findAll(): Promise<Chat[]> {
    return await this.chatModel.find();
  }

  public async findById(id: Types.ObjectId): Promise<Chat | null> {
    const chat = await this.chatModel.findById(id);
    if (!chat) {
      return null;
    }
    return chat;
  }

  public async findChatsMembers(chatId: string): Promise<ChatMember[]> {
    const existingChat = await this.findById(new Types.ObjectId(chatId));
    if (!existingChat) {
      throw new NotFoundException('Chat not found');
    }

    return await this.chatMemberService.findAllChatMembers(existingChat._id);
  }

  public async searchProjectChats(query: string, projectId: string): Promise<Chat[]> {
    return this.chatModel.aggregate([
      {
        $search: {
          index: INDEXES_NAMES.SEARCH_CHATS,
          regex: {
            query: `(.*)${query}(.*)`,
            path: 'subject',
            allowAnalyzedField: true,
          },
        },
      },
      {
        $match: {
          projectId,
        },
      },
    ]);
  }

  public async findChatsLastMessages(
    chatId: Types.ObjectId | string,
    limit: number,
  ): Promise<Message[]> {
    const existingChat = await this.findById(new Types.ObjectId(chatId));

    if (!existingChat) {
      throw new NotFoundException('Chat not found');
    }

    return this.redisService.findChatsLastMessages(chatId.toString(), limit);
  }

  public async create(
    projectId: string,
    memberIds: string[],
    subject: string,
  ): Promise<Chat> {
    const existingChat = await this.chatModel.findOne({
      projectId,
      subject,
    });

    if (existingChat) {
      throw new BadRequestException('Chat with such name in this project already exists');
    }

    const chat = await this.chatModel.create({ projectId, subject });

    if (!chat) {
      throw new BadRequestException('Chat not created');
    }

    await Promise.all(
      memberIds.map((userId) => this.chatMemberService.create(chat._id, userId)),
    );

    return chat;
  }

  public async sendMessageToChat(
    chatId: string,
    contextUser: ContextUser,
    body: string,
  ): Promise<Message> {
    const chat = await this.findById(new Types.ObjectId(chatId));

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const existingMember = await this.chatMemberService.findByIds(
      chat._id,
      contextUser.id,
    );

    if (!existingMember) {
      throw new NotFoundException('User is not a member of the chat');
    }

    const message = this.msgService.getModel(body, chatId, contextUser);

    await this.msgService.create({ body, chatId: chat._id.toString() }, contextUser);

    await this.redisService.sendMessageToChat(chatId, message);

    // await this.eventBridgeService.publishMessageEvent(message);

    const payload: MessageSendPayload = {
      messageSend: message,
    };

    await pubSub.publish(MESSAGE_TRIGGERS.SEND_MESSAGE, payload);

    return message;
  }

  public async removeUserFromChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.findById(new Types.ObjectId(chatId));

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const res = await this.chatMemberService.deleteByIds(chat._id, userId);

    if (!res) {
      throw new NotFoundException('User is not a member of the chat');
    }

    await this.msgService.updateMessagesForRemovedUser(chat._id, userId);

    return true;
  }

  public async addUserToChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.findById(new Types.ObjectId(chatId));

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const existing = await this.chatMemberService.findByIds(chat._id, userId);

    if (existing) {
      return false;
    }

    await this.chatMemberService.create(chat._id, userId);
    return true;
  }

  public async deleteById(id: string): Promise<boolean> {
    const objectId = new mongoose.Types.ObjectId(id);

    const chatToDelete = await this.findById(objectId);

    if (!chatToDelete) {
      return false;
    }

    await this.chatMemberService.deleteChatsAllMembers(objectId);

    await this.msgService.deleteChatsMessages(objectId);

    await this.chatModel.deleteOne({ _id: objectId });

    return true;
  }

  public async deleteAll(): Promise<boolean> {
    const chats = await this.chatModel.find();
    if (!chats) {
      return false;
    }

    await Promise.all(
      chats.map((chat) => this.chatMemberService.deleteChatsAllMembers(chat._id)),
    );

    await Promise.all(chats.map((chat) => this.msgService.deleteChatsMessages(chat._id)));

    await this.chatModel.deleteMany();

    return true;
  }
}
