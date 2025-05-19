import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChatMember } from './model/chat-member.model';

import mongoose, { Model } from 'mongoose';

@Injectable()
export class ChatMembersService {
  constructor(@InjectModel(ChatMember.name) private chatMemberModel: Model<ChatMember>) {}

  public async create(
    chatId: mongoose.Types.ObjectId,
    userId: string,
  ): Promise<ChatMember> {
    const existingChatMember = await this.chatMemberModel.findOne({
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

  public async findByIds(chatId: string, userId: string): Promise<ChatMember | null> {
    return this.chatMemberModel.findOne({ chatId, userId });
  }

  public async findAllChatMembers(chatId: string): Promise<ChatMember[]> {
    const chatObjectId = new mongoose.Types.ObjectId(chatId);
    return this.chatMemberModel.find({ chatId: chatObjectId });
  }

  public async findAllByUserId(userId: string): Promise<ChatMember[]> {
    return this.chatMemberModel.find({ userId });
  }

  public async findAllMembers(): Promise<ChatMember[]> {
    return this.chatMemberModel.find();
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

  public async deleteChatsAllMembers(chatId: mongoose.Types.ObjectId): Promise<boolean> {
    const res = await this.chatMemberModel.deleteMany({ chatId });
    return res.deletedCount > 0;
  }

  public async deleteAllMembers(): Promise<boolean> {
    const res = await this.chatMemberModel.deleteMany();
    return res.deletedCount > 0;
  }
}
