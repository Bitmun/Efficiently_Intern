import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Project } from './models/project.model';
import { ProjectsService } from './projects.service';

import { ChatsService } from 'src/chats/chats.service';
import { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

const mockProjectRepository = (): object => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUsersService = (): object => ({
  findById: jest.fn(),
});

const mockChatsService = (): object => ({
  searchProjectChats: jest.fn(),
  create: jest.fn(),
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repo: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepository },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: ChatsService, useFactory: mockChatsService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repo = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const projects: Project[] = [
        {
          title: 'Test',
          id: '1',
          body: 'Body',
          creator_id: '123',
          creator: new User(),
          members: [],
        },
      ];
      jest.spyOn(repo, 'find').mockResolvedValue(projects);
      expect(await service.findAll()).toEqual(projects);
    });
  });

  describe('create', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(service['usersService'], 'findById').mockResolvedValue(null);
      await expect(service.create('user-id', { title: '', body: '' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create and return project', async () => {
      const user: User = {
        id: 'user-id',
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdProjects: [],
        projects: [],
      };
      const project: Project = {
        id: 'proj-id',
        title: 'title',
        body: 'body',
        creator_id: '',
        creator: new User(),
        members: [],
      };
      jest.spyOn(service['usersService'], 'findById').mockResolvedValue(user);
      jest.spyOn(repo, 'create').mockReturnValue(project);
      jest.spyOn(repo, 'save').mockResolvedValue(project);

      const result = await service.create('user-id', { title: 'title', body: 'body' });
      expect(result).toEqual(project);
    });
  });

  describe('createProjectChat', () => {
    it('should throw if project not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(service.createProjectChat('proj', [], 'chat')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
