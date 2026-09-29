import { Module } from '@nestjs/common';
import { ExperienceRepository } from './experience.repository.js';
import { ExperienceResolver } from './experience.resolver.js';
import { ExperienceService } from './experience.service.js';

@Module({
  providers: [ExperienceRepository, ExperienceService, ExperienceResolver],
  exports: [ExperienceService],
})
export class ExperienceModule {}
