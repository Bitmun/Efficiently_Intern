import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './models/project.model';

import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private usersService: UsersService,
  ) {}

  public async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { creatorId } = createProjectDto;
    const user = await this.usersService.findById(creatorId);
    if (!user) {
      throw new NotFoundException('User not found to create project');
    }
    const project = this.projectsRepository.create({
      ...createProjectDto,
      creator: user,
    });
    return this.projectsRepository.save(project);
  }

  public async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['creator', 'members'] });
  }

  public async findById(id: number): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['creator', 'members'],
    });
  }

  public async addMemberToProject(projectId: number, userId: number): Promise<Project> {
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

    return project;
  }

  public async updateById(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findById(id);
  }

  public async deleteById(id: number): Promise<boolean> {
    const project = await this.findById(id);
    if (!project) {
      return false;
    }
    await this.projectsRepository.delete({ id });
    return true;
  }
}
