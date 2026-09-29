import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Education as EducationRow } from '../../generated/prisma/client.js';

@Injectable()
export class EducationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: string[]): Promise<EducationRow[]> {
    return this.prisma.education.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { graduationYear: 'desc' },
    });
  }
}
