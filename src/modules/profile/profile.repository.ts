import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type {
  Profile as ProfileRow,
  ProfileLink as ProfileLinkRow,
} from '../../generated/prisma/client.js';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOwner(): Promise<ProfileRow | null> {
    return this.prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  findLinksByProfileIds(profileIds: string[]): Promise<ProfileLinkRow[]> {
    return this.prisma.profileLink.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
