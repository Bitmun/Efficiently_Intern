import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChatMemberInfo } from './model/chat-member-info.model';

import { Model } from 'mongoose';

@Injectable()
export class ChatMemberInfoService {
  constructor(
    @InjectModel(ChatMemberInfo.name) private chatMemberModel: Model<ChatMemberInfo>,
  ) {}

  public async create(chatId: string, userId: string): Promise<ChatMemberInfo> {
    const existingChatMember = await this.chatMemberModel.find({
      chatId,
      userId,
    });

    if (existingChatMember) {
      throw new BadRequestException('User already in chat');
    }

    return this.chatMemberModel.create({
      chatId,
      userId,
    });
  }

  public async deleteByIds(chatId: string, userId: string): Promise<boolean> {
    const res = await this.chatMemberModel.findOneAndDelete({ chatId, userId });
    if (!res) {
      return false;
    }
    return true;
  }

  public async findByIds(chatId: string, userId: string): Promise<ChatMemberInfo | null> {
    return await this.chatMemberModel.findOne({ chatId, userId });
  }

  public async updateLastMsg(
    chatId: string,
    userId: string,
    newLastMsgId: string,
  ): Promise<boolean> {
    const res = await this.chatMemberModel.findOneAndUpdate(
      { chatId, userId },
      { lastReadMsgId: newLastMsgId },
    );
    if (!res) {
      return false;
    }
    return true;
  }

  public async deleteChatsAllInfo(chatId: string): Promise<boolean> {
    const res = await this.chatMemberModel.deleteMany({ chatId });
    return res.deletedCount > 0;
  }
}
