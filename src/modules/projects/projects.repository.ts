import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  Project as ProjectRow,
  Skill as SkillRow,
} from '../../generated/prisma/client.js';

export interface ProjectTechnologiesRow {
  id: string;
  technologies: SkillRow[];
}

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: string[]): Promise<ProjectRow[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findTechnologiesByProjectIds(
    projectIds: string[],
  ): Promise<ProjectTechnologiesRow[]> {
    return this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        technologies: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
