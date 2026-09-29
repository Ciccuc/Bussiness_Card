import type { EducationService } from '../../modules/education/education.service.js';
import type { ExperienceService } from '../../modules/experience/experience.service.js';
import type { ProfileService } from '../../modules/profile/profile.service.js';
import type { ProjectsService } from '../../modules/projects/projects.service.js';
import type { SkillsService } from '../../modules/skills/skills.service.js';
import type { Loaders } from '../graphql-context.js';
import { LoadersFactory } from './loaders.factory.js';

function fakeBatchMethod() {
  return vi.fn((ids: string[]) => Promise.resolve(ids.map((id) => [{ id }])));
}

type FakeBatchMethod = ReturnType<typeof fakeBatchMethod>;

function fakeServices() {
  return {
    profile: { getLinksByProfileIds: fakeBatchMethod() },
    skills: { getByProfileIds: fakeBatchMethod() },
    experience: {
      getByProfileIds: fakeBatchMethod(),
      getTechnologiesByExperienceIds: fakeBatchMethod(),
    },
    education: { getByProfileIds: fakeBatchMethod() },
    projects: {
      getByProfileIds: fakeBatchMethod(),
      getTechnologiesByProjectIds: fakeBatchMethod(),
    },
  };
}

type FakeServices = ReturnType<typeof fakeServices>;

function createFactory(services: FakeServices): LoadersFactory {
  return new LoadersFactory(
    services.profile as unknown as ProfileService,
    services.skills as unknown as SkillsService,
    services.experience as unknown as ExperienceService,
    services.education as unknown as EducationService,
    services.projects as unknown as ProjectsService,
  );
}

interface LoaderCase {
  loader: keyof Loaders;
  batchMethodOf: (services: FakeServices) => FakeBatchMethod;
}

const loaderCases: LoaderCase[] = [
  {
    loader: 'linksByProfileId',
    batchMethodOf: (services) => services.profile.getLinksByProfileIds,
  },
  {
    loader: 'skillsByProfileId',
    batchMethodOf: (services) => services.skills.getByProfileIds,
  },
  {
    loader: 'experienceByProfileId',
    batchMethodOf: (services) => services.experience.getByProfileIds,
  },
  {
    loader: 'educationByProfileId',
    batchMethodOf: (services) => services.education.getByProfileIds,
  },
  {
    loader: 'projectsByProfileId',
    batchMethodOf: (services) => services.projects.getByProfileIds,
  },
  {
    loader: 'technologiesByExperienceId',
    batchMethodOf: (services) =>
      services.experience.getTechnologiesByExperienceIds,
  },
  {
    loader: 'technologiesByProjectId',
    batchMethodOf: (services) => services.projects.getTechnologiesByProjectIds,
  },
];

describe('LoadersFactory', () => {
  it.each(loaderCases)(
    '$loader turns the loads of one tick into a single service call',
    async ({ loader, batchMethodOf }) => {
      const services = fakeServices();
      const loaders = createFactory(services).create();

      const results = await Promise.all(
        ['a', 'b', 'a', 'c'].map((id) => loaders[loader].load(id)),
      );

      expect(batchMethodOf(services)).toHaveBeenCalledExactlyOnceWith([
        'a',
        'b',
        'c',
      ]);
      expect(results).toEqual([
        [{ id: 'a' }],
        [{ id: 'b' }],
        [{ id: 'a' }],
        [{ id: 'c' }],
      ]);
    },
  );

  it('creates fresh loaders every time, so no cache is shared between requests', async () => {
    const services = fakeServices();
    const factory = createFactory(services);

    await factory.create().skillsByProfileId.load('a');
    await factory.create().skillsByProfileId.load('a');

    expect(services.skills.getByProfileIds).toHaveBeenCalledTimes(2);
  });
});
