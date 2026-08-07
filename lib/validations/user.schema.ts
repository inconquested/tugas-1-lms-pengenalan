import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "GURU", "SISWA"]);

// Clerk webhook sync payload.
export const CreateUserSchema = z.object({
  clerkId: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  role: RoleEnum.default("SISWA"),
});

// Profile modification.
export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  role: RoleEnum.optional(),
});
