import { z } from "zod";

export const CreateClassSubjectSchema = z.object({
  classId: z.uuid(),
  subjectId: z.uuid(),
  teacherId: z.uuid().optional(),
});

export const UpdateClassSubjectSchema = CreateClassSubjectSchema.partial();

// Teacher enters the subject join code to claim teaching a class-subject. Normalize to
// trimmed uppercase to match the uppercase-only codes stored in the DB (see class.schema).
export const JoinSubjectByCodeSchema = z.object({
  teacherJoinCode: z.string().trim().min(1).toUpperCase(),
});
