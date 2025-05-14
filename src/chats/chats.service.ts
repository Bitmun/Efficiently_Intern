import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Chat } from './models/chat.module';

import { Model } from 'mongoose';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private msgService: MessagesService,
  ) {}

  public async create(
    projectId: string,
    memberIds: string[],
    subject: string,
  ): Promise<Chat> {
    return await this.chatModel.create({ projectId, memberIds, subject });
  }

  public async findAll(): Promise<Chat[]> {
    return await this.chatModel.find();
  }

  public async findById(id: string): Promise<Chat | null> {
    const chat = await this.chatModel.findById(id);
    if (!chat) {
      return null;
    }
    return chat;
  }

  public async addUserToChat(chatId: string, userId: string): Promise<void> {
    await this.chatModel.updateOne({ _id: chatId }, { $push: { memberIds: userId } });
  }

  public async removeUserFromChat(chatId: string, userId: string): Promise<void> {
    await this.chatModel.updateOne({ _id: chatId }, { $pull: { memberIds: userId } });
    await this.msgService.updateMessagesForRemovedUser(chatId, userId);
  }
}
