import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './models/user.model';
import { UsersService } from './users.service';

import { Repository } from 'typeorm';

const mockUser: User = {
  id: '1',
  login: 'test',
  password: 'secret',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdProjects: [],
  projects: [],
};

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repo: Repository<User>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user if login is unique', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockUser);
      mockRepo.save.mockResolvedValue(mockUser);

      const result = await service.create({
        login: 'test',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toEqual(mockUser);
      expect(mockRepo.create).toHaveBeenCalledWith({
        login: 'test',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should throw if login already exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          login: 'test',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateById', () => {
    it('should update user and return updated user', async () => {
      mockRepo.update.mockResolvedValue(undefined);
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.updateById('1', {
        login: 'newlogin',
      });

      expect(mockRepo.update).toHaveBeenCalledWith({ id: '1' }, { login: 'newlogin' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteById', () => {
    it('should delete user if exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      mockRepo.delete.mockResolvedValue(undefined);

      const result = await service.deleteById('1');
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.deleteById('1');
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });
});
