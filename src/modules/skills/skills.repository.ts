import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Skill as SkillRow } from '../../generated/prisma/client.js';

@Injectable()
export class SkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: string[]): Promise<SkillRow[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
