import { z } from "zod";

export const CreateSubmissionSchema = z.object({
  assignmentId: z.uuid(),
  studentId: z.uuid(),
  filePath: z.string().min(1),
});

export const GradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
});
