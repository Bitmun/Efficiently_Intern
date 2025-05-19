import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './models/project.model';
import { ProjectsService } from './projects.service';

import { AuthGuard } from 'src/guards/auth.guard';
import { RlsInterceptor } from 'src/interceptors/RlsInterceptor';
import { AuthContext } from 'src/types/contextTypes';

@UseGuards(AuthGuard)
@UseInterceptors(RlsInterceptor)
@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Mutation(() => Project)
  public createProject(
    @Args('input') createProjectDto: CreateProjectDto,
    @Context() context: AuthContext,
  ): Promise<Project> {
    const { id } = context.req.user;
    return this.projectsService.create(id, createProjectDto);
  }

  @Query(() => [Project])
  public findAllProjects(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Query(() => Project)
  public getProject(
    @Args('id', { type: () => String }) id: string,
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
  public deleteProject(@Args('id', { type: () => String }) id: string): Promise<boolean> {
    return this.projectsService.deleteById(id);
  }

  @Mutation(() => Boolean)
  public deleteAllProjects(): Promise<boolean> {
    return this.projectsService.deleteAll();
  }

  @Mutation(() => Project)
  public async addMemberToProject(
    @Args('projectId', { type: () => String }) projectId: string,
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<Project> {
    return this.projectsService.addMemberToProject(projectId, userId);
  }
}
