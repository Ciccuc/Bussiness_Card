-- AlterEnum (hand-edited: Prisma appends new values; BEFORE keeps the order declared in
-- schema.prisma, which is the order Postgres sorts enum values in).
-- Nothing in this migration uses the new values: Postgres rejects a value added in the same
-- transaction. The seed that uses them runs after the migration has committed.
ALTER TYPE "skill_category" ADD VALUE 'FRONTEND' BEFORE 'BACKEND';
ALTER TYPE "skill_category" ADD VALUE 'AI' BEFORE 'DEVOPS';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[];
