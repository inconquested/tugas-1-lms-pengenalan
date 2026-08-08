import { z } from "zod";

// `<input type="time">` submits "HH:mm" 24h. Store as-is (plain text schedule slot).
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format waktu tidak valid (HH:mm).");

const ClassSubjectFields = z.object({
  classId: z.uuid(),
  subjectId: z.uuid(),
  teacherId: z.uuid().optional(),
  TimeStart: timeString,
  TimeEnd: timeString,
});

const endAfterStart = (d: { TimeStart?: string; TimeEnd?: string }) =>
  d.TimeStart === undefined || d.TimeEnd === undefined || d.TimeEnd > d.TimeStart;

export const CreateClassSubjectSchema = ClassSubjectFields.refine(endAfterStart, {
  path: ["TimeEnd"],
  message: "Jam selesai harus setelah jam mulai.",
});

export const UpdateClassSubjectSchema = ClassSubjectFields.partial().refine(endAfterStart, {
  path: ["TimeEnd"],
  message: "Jam selesai harus setelah jam mulai.",
});

// Teacher enters the subject join code to claim teaching a class-subject. Normalize to
// trimmed uppercase to match the uppercase-only codes stored in the DB (see class.schema).
export const JoinSubjectByCodeSchema = z.object({
  teacherJoinCode: z.string().trim().min(1).toUpperCase(),
});
