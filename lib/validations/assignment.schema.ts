import { z } from "zod";

export const CreateAssignmentSchema = z.object({
  classSubjectId: z.uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  additionalNote: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  externalReferences: z.array(z.url()).default([]),
});

export const UpdateAssignmentSchema = CreateAssignmentSchema.partial();
