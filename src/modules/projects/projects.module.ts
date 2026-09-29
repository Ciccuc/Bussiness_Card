import { Module } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';
import { ProjectsResolver } from './projects.resolver.js';
import { ProjectsService } from './projects.service.js';

@Module({
  providers: [ProjectsRepository, ProjectsService, ProjectsResolver],
  exports: [ProjectsService],
})
export class ProjectsModule {}
