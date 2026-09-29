import 'dotenv/config';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { validateEnv } from '../src/config/env.validation.js';
import { createPrismaAdapter } from '../src/database/prisma-adapter.js';
import { profileSeedData } from '../src/database/seed/profile.seed-data.js';
import {
  type SeededProfile,
  seedProfile,
} from '../src/database/seed/profile.seeder.js';
import { validateSeedData } from '../src/database/seed/seed-data.validation.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { SkillCategory } from '../src/generated/prisma/enums.js';
import { SANDBOX_EXAMPLE_DOCUMENT } from '../src/graphql/sandbox-example.js';
import { EducationRepository } from '../src/modules/education/education.repository.js';
import { buildEmploymentPeriod } from '../src/modules/experience/employment-period.js';
import { ExperienceRepository } from '../src/modules/experience/experience.repository.js';
import { ProfileRepository } from '../src/modules/profile/profile.repository.js';
import { ProjectsRepository } from '../src/modules/projects/projects.repository.js';
import { SkillsRepository } from '../src/modules/skills/skills.repository.js';

const ASSIGNMENT_QUERY = `
  query {
    profile {
      name
      description
      skills { name }
      experience { company position }
      projects { name }
    }
  }
`;

const FULL_PROFILE_QUERY = `
  query FullProfile {
    profile {
      id
      headline
      location
      languages
      workSetup
      links { type label url }
      frontendSkills: skills(category: FRONTEND) { name category }
      aiSkills: skills(category: AI) { name category }
      experience {
        company
        period { startDate endDate isCurrent durationInMonths }
        achievements
        technologies { name }
      }
      education {
        degree
        fieldOfStudy
        institution
        faculty
        location
        graduationYear
        isExpected
      }
      projects {
        name
        description
        highlights
        role
        year
        link
        url
        repositoryUrl
        technologies { name }
      }
    }
  }
`;

const seededCard = validateSeedData(profileSeedData);

const jobsMostRecentFirst = seededCard.experience.toSorted(
  (a, b) => b.startDate.getTime() - a.startDate.getTime(),
);

const degreesMostRecentFirst = seededCard.education.toSorted(
  (a, b) => b.graduationYear - a.graduationYear,
);

function skillsInCategory(category: SkillCategory) {
  return seededCard.skills
    .filter((skill) => skill.category === category)
    .map((skill) => ({ name: skill.name, category: skill.category }));
}

function technologiesInSkillOrder(technologyNames: string[]) {
  return seededCard.skills
    .filter((skill) => technologyNames.includes(skill.name))
    .map((skill) => ({ name: skill.name }));
}

function toIsoDate(date: Date | null): string | null {
  if (date === null) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function periodAsSerialized(startDate: Date, endDate: Date | null) {
  const period = buildEmploymentPeriod(startDate, endDate, new Date());
  return {
    startDate: toIsoDate(period.startDate),
    endDate: toIsoDate(period.endDate),
    isCurrent: period.isCurrent,
    durationInMonths: period.durationInMonths,
  };
}

describe('Business card API (e2e)', () => {
  let prisma: PrismaClient;
  let app: INestApplication;
  let seededProfile: SeededProfile;

  function postQuery(query: string) {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);
  }

  beforeAll(async () => {
    const { DATABASE_URL } = validateEnv(process.env);
    prisma = new PrismaClient({ adapter: createPrismaAdapter(DATABASE_URL) });
    seededProfile = await seedProfile(prisma, profileSeedData);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers the assignment query with the seeded profile', async () => {
    const { body } = await postQuery(ASSIGNMENT_QUERY);

    expect(body).toEqual({
      data: {
        profile: {
          name: seededCard.name,
          description: seededCard.description,
          skills: seededCard.skills.map((skill) => ({ name: skill.name })),
          experience: jobsMostRecentFirst.map((job) => ({
            company: job.company,
            position: job.position,
          })),
          projects: seededCard.projects.map((project) => ({
            name: project.name,
          })),
        },
      },
    });
  });

  it('resolves nested relations, computed fields and arguments', async () => {
    const { body } = await postQuery(FULL_PROFILE_QUERY);

    expect(body.errors).toBeUndefined();
    expect(body.data.profile).toEqual({
      id: seededProfile.id,
      headline: seededCard.headline,
      location: seededCard.location,
      languages: seededCard.languages,
      workSetup: seededCard.workSetup,
      links: seededCard.links.map((link) => ({
        type: link.type,
        label: link.label,
        url: link.url,
      })),
      frontendSkills: skillsInCategory('FRONTEND'),
      aiSkills: skillsInCategory('AI'),
      experience: jobsMostRecentFirst.map((job) => ({
        company: job.company,
        period: periodAsSerialized(job.startDate, job.endDate),
        achievements: job.achievements,
        technologies: technologiesInSkillOrder(job.technologies),
      })),
      education: degreesMostRecentFirst.map((degree) => ({
        degree: degree.degree,
        fieldOfStudy: degree.fieldOfStudy,
        institution: degree.institution,
        faculty: degree.faculty,
        location: degree.location,
        graduationYear: degree.graduationYear,
        isExpected: degree.graduationYear >= new Date().getUTCFullYear(),
      })),
      projects: seededCard.projects.map((project) => ({
        name: project.name,
        description: project.description,
        highlights: project.highlights,
        role: project.role,
        year: project.year,
        link: project.url ?? project.repositoryUrl,
        url: project.url,
        repositoryUrl: project.repositoryUrl,
        technologies: technologiesInSkillOrder(project.technologies),
      })),
    });
  });

  it('loads every relation level with a single batched repository call', async () => {
    const experienceTechnologiesQuery = vi.spyOn(
      ExperienceRepository.prototype,
      'findTechnologiesByExperienceIds',
    );
    const projectTechnologiesQuery = vi.spyOn(
      ProjectsRepository.prototype,
      'findTechnologiesByProjectIds',
    );
    const batchQueries = [
      vi.spyOn(ProfileRepository.prototype, 'findLinksByProfileIds'),
      vi.spyOn(SkillsRepository.prototype, 'findByProfileIds'),
      vi.spyOn(ExperienceRepository.prototype, 'findByProfileIds'),
      vi.spyOn(EducationRepository.prototype, 'findByProfileIds'),
      vi.spyOn(ProjectsRepository.prototype, 'findByProfileIds'),
      experienceTechnologiesQuery,
      projectTechnologiesQuery,
    ];

    await postQuery(FULL_PROFILE_QUERY);

    for (const batchQuery of batchQueries) {
      expect(batchQuery).toHaveBeenCalledOnce();
    }
    const [experienceIds] = experienceTechnologiesQuery.mock.calls[0];
    const [projectIds] = projectTechnologiesQuery.mock.calls[0];
    expect(experienceIds).toHaveLength(seededCard.experience.length);
    expect(projectIds).toHaveLength(seededCard.projects.length);
  });

  it('runs the operation pre-filled in Apollo Sandbox', async () => {
    const { body } = await postQuery(SANDBOX_EXAMPLE_DOCUMENT);

    expect(body.errors).toBeUndefined();
    expect(body.data.profile.name).toBe(seededCard.name);
  });

  it('serves Apollo Sandbox with the example operation at GET /graphql', async () => {
    const { text } = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200)
      .expect('Content-Type', /text\/html/);

    expect(text).toContain('new window.EmbeddedSandbox');
    expect(text).toContain('query BusinessCard');
  });

  it('reports a healthy database at GET /health', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  it('seeds idempotently: a second run keeps the profile id and mirrors the data file', async () => {
    const reseededProfile = await seedProfile(prisma, profileSeedData);

    expect(reseededProfile.id).toBe(seededProfile.id);
    const rowCounts = {
      profiles: await prisma.profile.count(),
      links: await prisma.profileLink.count(),
      skills: await prisma.skill.count(),
      experience: await prisma.experience.count(),
      education: await prisma.education.count(),
      projects: await prisma.project.count(),
    };
    expect(rowCounts).toEqual({
      profiles: 1,
      links: seededCard.links.length,
      skills: seededCard.skills.length,
      experience: seededCard.experience.length,
      education: seededCard.education.length,
      projects: seededCard.projects.length,
    });
  });

  it('answers with a NOT_FOUND error when no profile has been seeded', async () => {
    vi.spyOn(ProfileRepository.prototype, 'findOwner').mockResolvedValue(null);

    const { body } = await postQuery(ASSIGNMENT_QUERY);

    expect(body.data).toBeNull();
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0]).toMatchObject({
      path: ['profile'],
      extensions: { code: 'NOT_FOUND' },
    });
  });
});
