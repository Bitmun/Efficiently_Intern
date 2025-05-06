import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './models/project.model';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsService } from './projects.service';

import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), UsersModule],
  providers: [ProjectsService, ProjectsResolver],
})
export class ProjectsModule {}
