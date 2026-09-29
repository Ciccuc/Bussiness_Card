import type { Skill as SkillRow } from '../../generated/prisma/client.js';
import { SkillCategory } from '../../generated/prisma/enums.js';
import type { SkillsRepository } from './skills.repository.js';
import { SkillsService } from './skills.service.js';

function fakeRepository(rows: SkillRow[]): SkillsRepository {
  const fake: Pick<SkillsRepository, 'findByProfileIds'> = {
    findByProfileIds: (profileIds) =>
      Promise.resolve(rows.filter((row) => profileIds.includes(row.profileId))),
  };
  return fake as SkillsRepository;
}

function skillRow(
  profileId: string,
  name: string,
  category: SkillCategory,
): SkillRow {
  return {
    id: `${profileId}:${name}`,
    profileId,
    name,
    category,
    sortOrder: 0,
  };
}

describe('SkillsService', () => {
  describe('getByProfileIds', () => {
    it('returns the skills of each profile at the index of its id, keeping the stored order', async () => {
      const typescript = skillRow('p1', 'TypeScript', SkillCategory.LANGUAGE);
      const docker = skillRow('p1', 'Docker', SkillCategory.DEVOPS);
      const nestjs = skillRow('p2', 'NestJS', SkillCategory.BACKEND);
      const service = new SkillsService(
        fakeRepository([typescript, nestjs, docker]),
      );

      const skillsPerProfile = await service.getByProfileIds([
        'p2',
        'p1',
        'p3',
      ]);

      expect(skillsPerProfile).toEqual([[nestjs], [typescript, docker], []]);
    });
  });
});
