import type {
  Experience as ExperienceRow,
  Skill as SkillRow,
} from '../../generated/prisma/client.js';
import { SkillCategory } from '../../generated/prisma/enums.js';
import type {
  ExperienceRepository,
  ExperienceTechnologiesRow,
} from './experience.repository.js';
import { ExperienceService } from './experience.service.js';

function fakeRepository(
  experiences: ExperienceRow[],
  technologies: ExperienceTechnologiesRow[] = [],
): ExperienceRepository {
  const fake: Pick<
    ExperienceRepository,
    'findByProfileIds' | 'findTechnologiesByExperienceIds'
  > = {
    findByProfileIds: (profileIds) =>
      Promise.resolve(
        experiences.filter((row) => profileIds.includes(row.profileId)),
      ),
    findTechnologiesByExperienceIds: (experienceIds) =>
      Promise.resolve(
        technologies.filter((row) => experienceIds.includes(row.id)),
      ),
  };
  return fake as ExperienceRepository;
}

const date = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

function skillRow(name: string): SkillRow {
  return {
    id: name,
    profileId: 'p1',
    name,
    category: SkillCategory.BACKEND,
    sortOrder: 0,
  };
}

const currentJob: ExperienceRow = {
  id: 'e1',
  profileId: 'p1',
  company: 'Fintech startup',
  position: 'Backend developer',
  location: 'Remote',
  description: 'Payments platform.',
  startDate: date('2023-03-01'),
  endDate: null,
  achievements: ['Launched the GraphQL API.', 'Set up CI/CD.'],
};

const previousJob: ExperienceRow = {
  id: 'e2',
  profileId: 'p1',
  company: 'E-commerce company',
  position: 'Junior backend developer',
  location: null,
  description: null,
  startDate: date('2021-06-01'),
  endDate: date('2023-02-01'),
  achievements: [],
};

describe('ExperienceService', () => {
  describe('getByProfileIds', () => {
    beforeEach(() => {
      vi.useFakeTimers({ now: date('2026-09-28') });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('maps rows to jobs with their employment period, keeping the stored order', async () => {
      const service = new ExperienceService(
        fakeRepository([currentJob, previousJob]),
      );

      const [jobs] = await service.getByProfileIds(['p1']);

      expect(jobs).toEqual([
        {
          id: 'e1',
          company: 'Fintech startup',
          position: 'Backend developer',
          location: 'Remote',
          description: 'Payments platform.',
          period: {
            startDate: date('2023-03-01'),
            endDate: null,
            isCurrent: true,
            durationInMonths: 43,
          },
          achievements: ['Launched the GraphQL API.', 'Set up CI/CD.'],
        },
        {
          id: 'e2',
          company: 'E-commerce company',
          position: 'Junior backend developer',
          location: null,
          description: null,
          period: {
            startDate: date('2021-06-01'),
            endDate: date('2023-02-01'),
            isCurrent: false,
            durationInMonths: 21,
          },
          achievements: [],
        },
      ]);
    });

    it('returns the jobs of each profile at the index of its id', async () => {
      const jobOfAnotherProfile: ExperienceRow = {
        ...previousJob,
        id: 'e3',
        profileId: 'p2',
      };
      const service = new ExperienceService(
        fakeRepository([currentJob, jobOfAnotherProfile]),
      );

      const jobsPerProfile = await service.getByProfileIds(['p2', 'p3', 'p1']);

      const jobIdsPerProfile = jobsPerProfile.map((jobs) =>
        jobs.map((job) => job.id),
      );
      expect(jobIdsPerProfile).toEqual([['e3'], [], ['e1']]);
    });
  });

  describe('getTechnologiesByExperienceIds', () => {
    it('returns the technologies of each job at the index of its id', async () => {
      const nestjs = skillRow('NestJS');
      const express = skillRow('Express');
      const service = new ExperienceService(
        fakeRepository(
          [],
          [
            { id: 'e1', technologies: [nestjs] },
            { id: 'e2', technologies: [express, nestjs] },
          ],
        ),
      );

      const technologiesPerJob = await service.getTechnologiesByExperienceIds([
        'e2',
        'missing',
        'e1',
      ]);

      expect(technologiesPerJob).toEqual([[express, nestjs], [], [nestjs]]);
    });
  });
});
