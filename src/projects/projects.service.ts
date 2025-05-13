import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './models/project.model';

import { ChatsService } from 'src/chats/chats.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private usersService: UsersService,
    private chatsService: ChatsService,
  ) {}

  public async create(
    creatorId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const user = await this.usersService.findById(creatorId);
    if (!user) {
      throw new NotFoundException('User not found to create project');
    }
    const project = this.projectsRepository.create({
      ...createProjectDto,
      creator: user,
      members: [user],
    });

    const savedProject = await this.projectsRepository.save(project);

    const { id, creator_id } = savedProject;

    await this.chatsService.create(id, [creator_id]);

    return savedProject;
  }

  public async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['creator', 'members'] });
  }

  public async findById(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['creator', 'members'],
    });
  }

  public async addMemberToProject(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException('Project is not found');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User to add is not found');
    }

    project.members.map((member) => {
      if (member.id === user.id) {
        throw new BadRequestException('User is already in project');
      }
    });

    project.members.push(user);

    await this.projectsRepository.save(project);

    await this.chatsService.addUserToProjectChat(project.id, userId);

    return project;
  }

  public async updateById(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findById(id);
  }

  public async deleteById(id: string): Promise<boolean> {
    const project = await this.findById(id);
    if (!project) {
      return false;
    }
    await this.projectsRepository.delete({ id });
    return true;
  }
}
