import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Chat } from './models/chat.model';
import { ChatsService } from './chats.service';

import { Model, Types } from 'mongoose';
import { ChatMembersService } from 'src/chat-members/chat-members.service';
import { ChatMember } from 'src/chat-members/model/chat-member.model';
import { MessagesService } from 'src/messages/messages.service';
import { RedisService } from 'src/redis/redis.service';

const mockChatModel = (): object => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  aggregate: jest.fn(),
});

const idString = '60c72b2f9b1d4e3d88f1a3a7';

const mockMessagesService = (): object => ({
  getModel: jest.fn(),
  create: jest.fn(),
  updateMessagesForRemovedUser: jest.fn(),
  deleteChatsMessages: jest.fn(),
});

const mockChatMembersService = (): object => ({
  findAllChatMembers: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  deleteByIds: jest.fn(),
  deleteChatsAllMembers: jest.fn(),
});

const mockRedisService = (): object => ({
  sendMessageToChat: jest.fn(),
  findChatsLastMessages: jest.fn(),
});

describe('ChatsService', () => {
  let service: ChatsService;
  let model: Model<Chat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: getModelToken(Chat.name), useFactory: mockChatModel },
        { provide: MessagesService, useFactory: mockMessagesService },
        { provide: ChatMembersService, useFactory: mockChatMembersService },
        { provide: RedisService, useFactory: mockRedisService },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    model = module.get<Model<Chat>>(getModelToken(Chat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return chat', async () => {
      const chat = { _id: new Types.ObjectId(idString) };
      jest.spyOn(model, 'findById').mockResolvedValue(chat as any);
      expect(await service.findById(chat._id)).toEqual(chat);
    });

    it('should return null if not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);
      const chatId = new Types.ObjectId(idString);
      expect(await service.findById(chatId)).toBeNull();
    });
  });

  describe('create', () => {
    it('should throw if chat with same subject exists', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue({} as any);
      await expect(service.create('p1', [], 'sub')).rejects.toThrow();
    });

    it('should create chat and members', async () => {
      const createdChat = { _id: new Types.ObjectId(idString) };
      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      jest.spyOn(model, 'create').mockResolvedValue(createdChat as any);
      jest
        .spyOn(service['chatMemberService'], 'create')
        .mockResolvedValue({} as ChatMember);

      const result = await service.create('p1', ['u1', 'u2'], 'sub');
      expect(result).toEqual(createdChat);
    });
  });

  describe('sendMessageToChat', () => {
    it('should throw if chat not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(
        service.sendMessageToChat(idString, { id: 'u1', login: 'l1' }, 'text'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not member', async () => {
      const chatId = new Types.ObjectId(idString);
      jest.spyOn(service, 'findById').mockResolvedValue({
        _id: chatId,
      } as any);
      jest.spyOn(service['chatMemberService'], 'findByIds').mockResolvedValue(null);
      await expect(
        service.sendMessageToChat(idString, { id: 'u1', login: 'l1' }, 'text'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
