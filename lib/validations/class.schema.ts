import { z } from "zod";

export const CreateClassSchema = z.object({
  name: z.string().min(1),
  academicYearId: z.uuid(),
  homeroomTeacherId: z.uuid().optional(),
});

export const UpdateClassSchema = CreateClassSchema.partial();

// Join codes are generated from an uppercase-only alphabet (genCode) and matched exactly in
// the DB, so normalize user input to trimmed uppercase — otherwise a correct code typed in
// lowercase/mixed case is rejected as invalid.
const joinCode = z.string().trim().min(1).toUpperCase();

// Student enters the class join code to enroll.
export const JoinClassByCodeSchema = z.object({
  studentJoinCode: joinCode,
});

// Teacher enters the homeroom (wali kelas) join code to claim a class.
export const JoinHomeroomByCodeSchema = z.object({
  homeroomJoinCode: joinCode,
});
