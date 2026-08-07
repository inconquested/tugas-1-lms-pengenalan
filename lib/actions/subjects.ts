"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  CreateSubjectSchema,
  UpdateSubjectSchema,
} from "@/lib/validations/subject.schema";
import * as svc from "@/lib/services/subject.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str } from "@/lib/actions/form";

export async function createSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = CreateSubjectSchema.safeParse({
    name: str(formData.get("name")),
    code: str(formData.get("code")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.createSubject(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/subjects");
  return ok("Mata pelajaran ditambahkan.");
}

export async function updateSubjectAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = UpdateSubjectSchema.safeParse({
    name: str(formData.get("name")),
    code: str(formData.get("code")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.updateSubject(id, parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/subjects");
  return ok("Mata pelajaran diperbarui.");
}

export async function deleteSubjectAction(id: string): Promise<ActionState> {
  await requireRole("ADMIN");
  try {
    await svc.deleteSubject(id);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/subjects");
  return ok("Mata pelajaran dihapus.");
}
