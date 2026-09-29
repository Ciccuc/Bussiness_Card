import type {
  Project as ProjectRow,
  Skill as SkillRow,
} from '../../generated/prisma/client.js';
import { SkillCategory } from '../../generated/prisma/enums.js';
import type {
  ProjectsRepository,
  ProjectTechnologiesRow,
} from './projects.repository.js';
import { ProjectsService } from './projects.service.js';

function fakeRepository(
  projects: ProjectRow[],
  technologies: ProjectTechnologiesRow[] = [],
): ProjectsRepository {
  const fake: Pick<
    ProjectsRepository,
    'findByProfileIds' | 'findTechnologiesByProjectIds'
  > = {
    findByProfileIds: (profileIds) =>
      Promise.resolve(
        projects.filter((project) => profileIds.includes(project.profileId)),
      ),
    findTechnologiesByProjectIds: (projectIds) =>
      Promise.resolve(
        technologies.filter((row) => projectIds.includes(row.id)),
      ),
  };
  return fake as ProjectsRepository;
}

function projectRow(id: string, profileId: string): ProjectRow {
  return {
    id,
    profileId,
    name: `Project ${id}`,
    description: null,
    highlights: [],
    role: null,
    year: null,
    url: null,
    repositoryUrl: `https://github.com/jane/${id}`,
    sortOrder: 0,
  };
}

function skillRow(name: string): SkillRow {
  return {
    id: name,
    profileId: 'p1',
    name,
    category: SkillCategory.BACKEND,
    sortOrder: 0,
  };
}

describe('ProjectsService', () => {
  describe('getByProfileIds', () => {
    it('returns the projects of each profile at the index of its id', async () => {
      const service = new ProjectsService(
        fakeRepository([
          projectRow('api', 'p1'),
          projectRow('foreign', 'p2'),
          projectRow('bot', 'p1'),
        ]),
      );

      const projectsPerProfile = await service.getByProfileIds([
        'p1',
        'p2',
        'p3',
      ]);

      const projectIdsPerProfile = projectsPerProfile.map((projects) =>
        projects.map((project) => project.id),
      );
      expect(projectIdsPerProfile).toEqual([['api', 'bot'], ['foreign'], []]);
    });

    it('maps a row to a project with its highlights, role, year and primary link', async () => {
      const row: ProjectRow = {
        ...projectRow('api', 'p1'),
        description: 'GraphQL API',
        highlights: ['Batched every relation level.', 'Seeded idempotently.'],
        role: 'backend, infrastructure',
        year: 2026,
        url: 'https://card.example.com',
      };
      const service = new ProjectsService(fakeRepository([row]));

      const projectsPerProfile = await service.getByProfileIds(['p1']);

      expect(projectsPerProfile).toEqual([
        [
          {
            id: 'api',
            name: 'Project api',
            description: 'GraphQL API',
            highlights: [
              'Batched every relation level.',
              'Seeded idempotently.',
            ],
            role: 'backend, infrastructure',
            year: 2026,
            link: 'https://card.example.com',
            url: 'https://card.example.com',
            repositoryUrl: 'https://github.com/jane/api',
          },
        ],
      ]);
    });

    it.each([
      {
        target: 'the live project over the repository',
        url: 'https://demo.example.com',
        repositoryUrl: 'https://github.com/jane/api',
        link: 'https://demo.example.com',
      },
      {
        target: 'the live project without a repository',
        url: 'https://demo.example.com',
        repositoryUrl: null,
        link: 'https://demo.example.com',
      },
      {
        target: 'the repository without a live project',
        url: null,
        repositoryUrl: 'https://github.com/jane/api',
        link: 'https://github.com/jane/api',
      },
    ])('links to $target', async ({ url, repositoryUrl, link }) => {
      const service = new ProjectsService(
        fakeRepository([{ ...projectRow('api', 'p1'), url, repositoryUrl }]),
      );

      const [[project]] = await service.getByProfileIds(['p1']);

      expect(project?.link).toBe(link);
    });

    it('fails with the name of the violated constraint when a project has no link at all', async () => {
      const service = new ProjectsService(
        fakeRepository([
          { ...projectRow('api', 'p1'), url: null, repositoryUrl: null },
        ]),
      );

      await expect(service.getByProfileIds(['p1'])).rejects.toThrow(
        'Project api violates projects_url_or_repository_url_check',
      );
    });
  });

  describe('getTechnologiesByProjectIds', () => {
    it('returns the technologies of each project at the index of its id', async () => {
      const nestjs = skillRow('NestJS');
      const prisma = skillRow('Prisma');
      const service = new ProjectsService(
        fakeRepository(
          [],
          [
            { id: 'api', technologies: [nestjs, prisma] },
            { id: 'bot', technologies: [] },
          ],
        ),
      );

      const technologiesPerProject = await service.getTechnologiesByProjectIds([
        'bot',
        'missing',
        'api',
      ]);

      expect(technologiesPerProject).toEqual([[], [], [nestjs, prisma]]);
    });
  });
});
