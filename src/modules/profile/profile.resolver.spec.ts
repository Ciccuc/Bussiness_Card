import DataLoader from 'dataloader';
import { SkillCategory } from '../../generated/prisma/enums.js';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import type { Skill } from '../skills/models/skill.model.js';
import type { Profile } from './models/profile.model.js';
import { ProfileResolver } from './profile.resolver.js';
import type { ProfileService } from './profile.service.js';

function contextLoadingSkills(skills: Skill[]): GraphQLContext {
  const loaders = {
    skillsByProfileId: new DataLoader<string, Skill[]>((profileIds) =>
      Promise.resolve(profileIds.map(() => skills)),
    ),
  };
  return { loaders } as GraphQLContext;
}

function skill(name: string, category: SkillCategory): Skill {
  return { id: name, name, category };
}

const owner: Profile = {
  id: 'p1',
  name: 'Jane Doe',
  headline: 'Backend developer',
  description: 'Builds APIs.',
  location: null,
  languages: [],
  workSetup: null,
};

const typescript = skill('TypeScript', SkillCategory.LANGUAGE);
const docker = skill('Docker', SkillCategory.DEVOPS);
const sql = skill('SQL', SkillCategory.LANGUAGE);

describe('ProfileResolver', () => {
  const unusedProfileService = {} as ProfileService;
  const resolver = new ProfileResolver(unusedProfileService);

  describe('skills', () => {
    it('keeps only the skills of the requested category, in display order', async () => {
      const context = contextLoadingSkills([typescript, docker, sql]);

      const skills = await resolver.skills(
        owner,
        context,
        SkillCategory.LANGUAGE,
      );

      expect(skills).toEqual([typescript, sql]);
    });

    it.each([undefined, null])(
      'returns every skill when the category is %s',
      async (category) => {
        const context = contextLoadingSkills([typescript, docker, sql]);

        const skills = await resolver.skills(owner, context, category);

        expect(skills).toEqual([typescript, docker, sql]);
      },
    );

    it('returns no skills when none has the requested category', async () => {
      const context = contextLoadingSkills([typescript, docker, sql]);

      const skills = await resolver.skills(
        owner,
        context,
        SkillCategory.TESTING,
      );

      expect(skills).toEqual([]);
    });
  });
});
