import { Module } from '@nestjs/common';
import { EducationModule } from '../../modules/education/education.module.js';
import { ExperienceModule } from '../../modules/experience/experience.module.js';
import { ProfileModule } from '../../modules/profile/profile.module.js';
import { ProjectsModule } from '../../modules/projects/projects.module.js';
import { SkillsModule } from '../../modules/skills/skills.module.js';
import { LoadersFactory } from './loaders.factory.js';

@Module({
  imports: [
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    EducationModule,
    ProjectsModule,
  ],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
