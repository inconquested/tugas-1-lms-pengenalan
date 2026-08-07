/*
  Warnings:

  - Added the required column `TimeEnd` to the `ClassSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TimeStart` to the `ClassSubject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassSubject" ADD COLUMN     "TimeEnd" TEXT NOT NULL,
ADD COLUMN     "TimeStart" TEXT NOT NULL;
