import { Module } from '@nestjs/common';
import { EducationRepository } from './education.repository.js';
import { EducationService } from './education.service.js';

@Module({
  providers: [EducationRepository, EducationService],
  exports: [EducationService],
})
export class EducationModule {}
