import { PrismaPg } from '@prisma/adapter-pg';

const CONNECTION_TIMEOUT_MS = 5_000;

export function createPrismaAdapter(connectionString: string): PrismaPg {
  return new PrismaPg({
    connectionString,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
}
