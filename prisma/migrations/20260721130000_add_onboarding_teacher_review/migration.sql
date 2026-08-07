-- CreateEnum
CREATE TYPE "TeacherRequestStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "onboarded" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "teacherRequestStatus" "TeacherRequestStatus" NOT NULL DEFAULT 'NONE';

-- Backfill: existing users are already active accounts, so treat them as onboarded,
-- and reflect approved teachers so they are not asked to re-apply.
UPDATE "User" SET "onboarded" = true;
UPDATE "User" SET "teacherRequestStatus" = 'APPROVED' WHERE "role" = 'GURU';
