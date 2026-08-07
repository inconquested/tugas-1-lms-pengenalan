import { z } from "zod";

export const CreateSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

export const UpdateSubjectSchema = CreateSubjectSchema.partial();
