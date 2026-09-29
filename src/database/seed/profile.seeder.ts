import type { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import {
  type ProfileSeedData,
  type ValidatedProfileSeedData,
  validateSeedData,
} from './seed-data.validation.js';

const SEED_TRANSACTION_TIMEOUT_MS = 30_000;

export interface SeededProfile {
  id: string;
}

export async function seedProfile(
  prisma: PrismaClient,
  data: ProfileSeedData,
): Promise<SeededProfile> {
  const validData = validateSeedData(data);
  return prisma.$transaction(
    (transaction) => syncProfile(transaction, validData),
    { timeout: SEED_TRANSACTION_TIMEOUT_MS },
  );
}

async function syncProfile(
  transaction: Prisma.TransactionClient,
  data: ValidatedProfileSeedData,
): Promise<SeededProfile> {
  const profile = await upsertProfile(transaction, data);
  await deleteOtherProfiles(transaction, profile.id);
  await deleteProfileContent(transaction, profile.id);
  await createLinks(transaction, profile.id, data);
  await createEducation(transaction, profile.id, data);
  await createSkills(transaction, profile.id, data);
  await createExperience(transaction, profile.id, data);
  await createProjects(transaction, profile.id, data);
  return profile;
}

async function upsertProfile(
  transaction: Prisma.TransactionClient,
  data: ValidatedProfileSeedData,
): Promise<SeededProfile> {
  const columns = {
    name: data.name,
    headline: data.headline,
    description: data.description,
    location: data.location,
    languages: data.languages,
    workSetup: data.workSetup,
  };
  return transaction.profile.upsert({
    where: { slug: data.slug },
    create: { slug: data.slug, ...columns },
    update: columns,
    select: { id: true },
  });
}

async function deleteOtherProfiles(
  transaction: Prisma.TransactionClient,
  keptProfileId: string,
): Promise<void> {
  await transaction.profile.deleteMany({
    where: { id: { not: keptProfileId } },
  });
}

async function deleteProfileContent(
  transaction: Prisma.TransactionClient,
  profileId: string,
): Promise<void> {
  const belongsToProfile = { where: { profileId } };
  await transaction.profileLink.deleteMany(belongsToProfile);
  await transaction.skill.deleteMany(belongsToProfile);
  await transaction.experience.deleteMany(belongsToProfile);
  await transaction.education.deleteMany(belongsToProfile);
  await transaction.project.deleteMany(belongsToProfile);
}

async function createLinks(
  transaction: Prisma.TransactionClient,
  profileId: string,
  data: ValidatedProfileSeedData,
): Promise<void> {
  await transaction.profileLink.createMany({
    data: data.links.map((link, index) => ({
      profileId,
      type: link.type,
      label: link.label,
      url: link.url,
      sortOrder: index,
    })),
  });
}

async function createEducation(
  transaction: Prisma.TransactionClient,
  profileId: string,
  data: ValidatedProfileSeedData,
): Promise<void> {
  await transaction.education.createMany({
    data: data.education.map((degree) => ({
      profileId,
      degree: degree.degree,
      fieldOfStudy: degree.fieldOfStudy,
      institution: degree.institution,
      faculty: degree.faculty,
      location: degree.location,
      graduationYear: degree.graduationYear,
    })),
  });
}

async function createSkills(
  transaction: Prisma.TransactionClient,
  profileId: string,
  data: ValidatedProfileSeedData,
): Promise<void> {
  await transaction.skill.createMany({
    data: data.skills.map((skill, index) => ({
      profileId,
      name: skill.name,
      category: skill.category,
      sortOrder: index,
    })),
  });
}

async function createExperience(
  transaction: Prisma.TransactionClient,
  profileId: string,
  data: ValidatedProfileSeedData,
): Promise<void> {
  for (const job of data.experience) {
    await transaction.experience.create({
      data: {
        profileId,
        company: job.company,
        position: job.position,
        location: job.location,
        description: job.description,
        startDate: job.startDate,
        endDate: job.endDate,
        achievements: job.achievements,
        technologies: connectSkillsByName(profileId, job.technologies),
      },
    });
  }
}

async function createProjects(
  transaction: Prisma.TransactionClient,
  profileId: string,
  data: ValidatedProfileSeedData,
): Promise<void> {
  for (const [index, project] of data.projects.entries()) {
    await transaction.project.create({
      data: {
        profileId,
        name: project.name,
        description: project.description,
        highlights: project.highlights,
        role: project.role,
        year: project.year,
        url: project.url,
        repositoryUrl: project.repositoryUrl,
        sortOrder: index,
        technologies: connectSkillsByName(profileId, project.technologies),
      },
    });
  }
}

function connectSkillsByName(
  profileId: string,
  skillNames: string[],
): { connect: Prisma.SkillWhereUniqueInput[] } {
  return {
    connect: skillNames.map((name) => ({
      profileId_name: { profileId, name },
    })),
  };
}
