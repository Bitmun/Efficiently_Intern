import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Chat } from './models/chat.model';

import mongoose, { Model, Types } from 'mongoose';
import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { INDEXES_NAMES } from 'src/indexes/indexes-names';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @Inject(forwardRef(() => MessagesService))
    private readonly msgService: MessagesService,
    private readonly chatMemberService: ChatMembersService,
  ) {}

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

  public async deleteById(id: string): Promise<boolean> {
    const chatToDelete = await this.chatModel.findByIdAndDelete(id);

    if (!chatToDelete) {
      return false;
    }

    const objectId = new mongoose.Types.ObjectId(id);

    await this.chatMemberService.deleteChatsAllMembers(objectId);

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

    await this.chatModel.deleteMany();

    return true;
  }

  public async addUserToChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const existing = await this.chatMemberService.findByIds(chatId, userId);

    if (existing) {
      return false;
    }

    const chatObjectId = new mongoose.Types.ObjectId(chatId);

    await this.chatMemberService.create(chatObjectId, userId);
    return true;
  }

  public async removeUserFromChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const res = await this.chatMemberService.deleteByIds(chatId, userId);

    if (!res) {
      return false;
    }

    await this.msgService.updateMessagesForRemovedUser(chatId, userId);

    return true;
  }
}
