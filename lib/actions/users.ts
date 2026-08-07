"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/validations/user.schema";
import * as svc from "@/lib/services/user.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str } from "@/lib/actions/form";

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  // Admin-provisioned users get a placeholder clerkId; the Clerk webhook reconciles
  // it to the real identity on first sign-in (upsert keys on clerkId).
  const parsed = CreateUserSchema.safeParse({
    clerkId: `pending-${crypto.randomUUID()}`,
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    role: str(formData.get("role")) ?? "SISWA",
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.createUserByAdmin(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return ok("Pengguna ditambahkan.");
}

export async function updateUserAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = UpdateUserSchema.safeParse({
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    role: str(formData.get("role")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.updateUser(id, parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/users");
  return ok("Pengguna diperbarui.");
}

// --- Teacher registration review ---

export async function approveTeacherAction(userId: string): Promise<ActionState> {
  await requireRole("ADMIN");
  try {
    await svc.approveTeacherRequest(userId);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/teacher-requests");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return ok("Pendaftaran guru disetujui.");
}

export async function rejectTeacherAction(userId: string): Promise<ActionState> {
  await requireRole("ADMIN");
  try {
    await svc.rejectTeacherRequest(userId);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/teacher-requests");
  revalidatePath("/admin/users");
  return ok("Pendaftaran guru ditolak.");
}
