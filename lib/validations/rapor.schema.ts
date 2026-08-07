import { z } from "zod";

const score = z.number().min(0).max(100);

export const UpsertRaporComponentSchema = z.object({
  classSubjectId: z.uuid(),
  studentId: z.uuid(),
  knowledgeScore: score.optional(),
  skillScore: score.optional(),
});

export const UpdateRaporFinalSchema = z.object({
  studentId: z.uuid(),
  academicYearId: z.uuid(),
  attendanceSick: z.number().int().min(0).optional(),
  attendancePermission: z.number().int().min(0).optional(),
  attendanceAlpha: z.number().int().min(0).optional(),
  behaviorNote: z.string().optional(),
});

export const LockRaporSchema = z.object({
  raporFinalId: z.uuid(),
  isLocked: z.boolean(),
});
