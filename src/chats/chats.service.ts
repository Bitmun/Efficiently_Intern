import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Chat } from './models/chat.model';

import { Model } from 'mongoose';
import { ChatMemberInfoService } from 'src/chat-member-info/chat-member-info.service';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @Inject(forwardRef(() => MessagesService))
    private readonly msgService: MessagesService,
    private readonly chatMemberService: ChatMemberInfoService,
  ) {}

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

  public async findById(id: string): Promise<Chat | null> {
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

    await this.chatMemberService.deleteChatsAllMembers(id);

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

    await this.chatMemberService.create(chatId, userId);
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
