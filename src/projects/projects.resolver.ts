import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './models/project.model';
import { ProjectsService } from './projects.service';

import { AuthGuard } from 'src/guards/auth.guard';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Mutation(() => Project)
  public createProject(
    @Args('input') createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Query(() => [Project])
  @UseGuards(AuthGuard)
  public findAllProjects(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Query(() => Project)
  public getProject(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Project | null> {
    return this.projectsService.findById(id);
  }

  @Mutation(() => Project)
  public updateProject(
    @Args('input') updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    const { id } = updateProjectDto;
    return this.projectsService.updateById(id, updateProjectDto);
  }

  @Mutation(() => Boolean)
  public deleteProject(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.projectsService.deleteById(id);
  }

  @Mutation(() => Project)
  public async addMemberToProject(
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<Project> {
    return this.projectsService.addMemberToProject(projectId, userId);
  }
}
