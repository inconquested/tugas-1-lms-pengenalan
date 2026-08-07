"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
} from "@/lib/validations/assignment.schema";
import * as svc from "@/lib/services/assignment.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str, lines } from "@/lib/actions/form";

export async function createAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("GURU");
  const classSubjectId = str(formData.get("classSubjectId"));
  const parsed = CreateAssignmentSchema.safeParse({
    classSubjectId,
    title: str(formData.get("title")),
    description: str(formData.get("description")),
    additionalNote: str(formData.get("additionalNote")),
    dueDate: str(formData.get("dueDate")),
    externalReferences: lines(formData.get("externalReferences")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.createAssignment(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/classes/${classSubjectId}/assignments`);
  // Navigate back to the assignment list on success.
  redirect(`/guru/classes/${classSubjectId}/assignments`);
}

export async function updateAssignmentAction(
  id: string,
  classSubjectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("GURU");
  const parsed = UpdateAssignmentSchema.safeParse({
    title: str(formData.get("title")),
    description: str(formData.get("description")),
    additionalNote: str(formData.get("additionalNote")),
    dueDate: str(formData.get("dueDate")),
    externalReferences: lines(formData.get("externalReferences")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.updateAssignment(id, parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/classes/${classSubjectId}/assignments`);
  revalidatePath(`/guru/classes/${classSubjectId}/assignments/${id}`);
  return ok("Tugas diperbarui.");
}

export async function deleteAssignmentAction(
  id: string,
  classSubjectId: string,
): Promise<ActionState> {
  await requireRole("GURU");
  try {
    await svc.deleteAssignment(id);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/classes/${classSubjectId}/assignments`);
  return ok("Tugas dihapus.");
}
