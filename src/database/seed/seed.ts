import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { validateEnv } from '../../config/env.validation.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import { createPrismaAdapter } from '../prisma-adapter.js';
import { profileSeedData } from './profile.seed-data.js';
import { seedProfile } from './profile.seeder.js';

const logger = new Logger('Seed');

async function seed(): Promise<void> {
  const { DATABASE_URL } = validateEnv(process.env);
  const prisma = new PrismaClient({
    adapter: createPrismaAdapter(DATABASE_URL),
  });
  try {
    const profile = await seedProfile(prisma, profileSeedData);
    const { slug, links, skills, experience, education, projects } =
      profileSeedData;
    logger.log(
      `Profile "${slug}" (${profile.id}) is in sync: ` +
        `${links.length} links, ${skills.length} skills, ` +
        `${experience.length} experience entries, ${education.length} education entries, ` +
        `${projects.length} projects`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof AggregateError) {
    return error.errors.map(errorMessage).join('; ');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

try {
  await seed();
} catch (error) {
  logger.error(`Seeding failed. ${errorMessage(error)}`);
  process.exitCode = 1;
}
