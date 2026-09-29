import { NotFoundException } from '@nestjs/common';
import type {
  Profile as ProfileRow,
  ProfileLink as ProfileLinkRow,
} from '../../generated/prisma/client.js';
import { LinkType } from '../../generated/prisma/enums.js';
import type { ProfileRepository } from './profile.repository.js';
import { ProfileService } from './profile.service.js';

function fakeRepository(
  owner: ProfileRow | null,
  links: ProfileLinkRow[] = [],
): ProfileRepository {
  const fake: Pick<ProfileRepository, 'findOwner' | 'findLinksByProfileIds'> = {
    findOwner: () => Promise.resolve(owner),
    findLinksByProfileIds: (profileIds) =>
      Promise.resolve(
        links.filter((link) => profileIds.includes(link.profileId)),
      ),
  };
  return fake as ProfileRepository;
}

const owner: ProfileRow = {
  id: 'p1',
  slug: 'owner',
  name: 'Jane Doe',
  headline: 'Backend developer',
  description: 'Builds APIs.',
  location: null,
  languages: [],
  workSetup: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function linkRow(
  profileId: string,
  type: LinkType,
  url: string,
): ProfileLinkRow {
  return { id: url, profileId, type, label: type, url, sortOrder: 0 };
}

describe('ProfileService', () => {
  describe('getOwnerProfile', () => {
    it('returns the owner profile', async () => {
      const service = new ProfileService(fakeRepository(owner));

      await expect(service.getOwnerProfile()).resolves.toBe(owner);
    });

    it('throws NotFoundException when the profile has not been seeded', async () => {
      const service = new ProfileService(fakeRepository(null));

      await expect(service.getOwnerProfile()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getLinksByProfileIds', () => {
    it('returns the links of each profile at the index of its id', async () => {
      const github = linkRow('p1', LinkType.GITHUB, 'https://github.com/jane');
      const email = linkRow('p1', LinkType.EMAIL, 'mailto:jane@example.com');
      const website = linkRow('p2', LinkType.WEBSITE, 'https://example.com');
      const service = new ProfileService(
        fakeRepository(owner, [github, website, email]),
      );

      const linksPerProfile = await service.getLinksByProfileIds([
        'p1',
        'p3',
        'p2',
      ]);

      expect(linksPerProfile).toEqual([[github, email], [], [website]]);
    });
  });
});
