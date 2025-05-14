import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Chat } from './models/chat.module';

import { Model } from 'mongoose';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @Inject(forwardRef(() => MessagesService))
    private readonly msgService: MessagesService,
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

  public async addUserToChat(chatId: string, userId: string): Promise<boolean> {
    const res = await this.chatModel.updateOne(
      { _id: chatId },
      { $push: { memberIds: userId } },
    );
    return res.modifiedCount > 0;
  }

  public async removeUserFromChat(chatId: string, userId: string): Promise<boolean> {
    const res = await this.chatModel.updateOne(
      { _id: chatId },
      { $pull: { memberIds: userId } },
    );

    if (res.modifiedCount === 0) {
      return false;
    }

    await this.msgService.updateMessagesForRemovedUser(chatId, userId);

    return true;
  }
}
