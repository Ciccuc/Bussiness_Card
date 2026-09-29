import { Module } from '@nestjs/common';
import { SkillsRepository } from './skills.repository.js';
import { SkillsService } from './skills.service.js';

@Module({
  providers: [SkillsRepository, SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
