import { z } from "zod";

export const SemesterEnum = z.enum(["GANJIL", "GENAP"]);

export const CreateAcademicYearSchema = z.object({
  year: z.string().regex(/^\d{4}\/\d{4}$/, "Format harus YYYY/YYYY, mis. 2025/2026"),
  semester: SemesterEnum,
  isActive: z.boolean().optional(),
});

export const UpdateAcademicYearSchema = CreateAcademicYearSchema.partial();
