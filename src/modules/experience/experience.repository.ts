import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  Experience as ExperienceRow,
  Skill as SkillRow,
} from '../../generated/prisma/client.js';

export interface ExperienceTechnologiesRow {
  id: string;
  technologies: SkillRow[];
}

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: string[]): Promise<ExperienceRow[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { startDate: 'desc' },
    });
  }

  findTechnologiesByExperienceIds(
    experienceIds: string[],
  ): Promise<ExperienceTechnologiesRow[]> {
    return this.prisma.experience.findMany({
      where: { id: { in: experienceIds } },
      select: {
        id: true,
        technologies: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
