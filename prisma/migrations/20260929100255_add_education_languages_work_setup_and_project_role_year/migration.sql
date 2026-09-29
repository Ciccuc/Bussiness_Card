-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "work_setup" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "role" TEXT,
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "education" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "degree" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "faculty" TEXT,
    "location" TEXT,
    "graduation_year" INTEGER NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "education_profile_id_graduation_year_idx" ON "education"("profile_id", "graduation_year");

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
