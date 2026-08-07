"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  UpsertRaporComponentSchema,
  UpdateRaporFinalSchema,
  LockRaporSchema,
} from "@/lib/validations/rapor.schema";
import * as svc from "@/lib/services/rapor.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str, num } from "@/lib/actions/form";

// Teacher inputs knowledge/skill for one student, then the final score is recomputed.
export async function upsertRaporComponentAction(
  classSubjectId: string,
  studentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("GURU");
  const parsed = UpsertRaporComponentSchema.safeParse({
    classSubjectId,
    studentId,
    knowledgeScore: num(formData.get("knowledgeScore")),
    skillScore: num(formData.get("skillScore")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.upsertRaporComponent(parsed.data);
    await svc.calculateFinalGrade(studentId, classSubjectId);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/classes/${classSubjectId}/rapor-components`);
  return ok("Nilai rapor tersimpan.");
}

// Wali kelas records attendance and a behaviour note for one student.
export async function updateRaporFinalAction(
  classId: string,
  studentId: string,
  academicYearId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("GURU");
  const parsed = UpdateRaporFinalSchema.safeParse({
    studentId,
    academicYearId,
    attendanceSick: num(formData.get("attendanceSick")),
    attendancePermission: num(formData.get("attendancePermission")),
    attendanceAlpha: num(formData.get("attendanceAlpha")),
    behaviorNote: str(formData.get("behaviorNote")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.updateRaporFinalNotes(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/homeroom/${classId}`);
  return ok("Data wali kelas tersimpan.");
}

// Admin locks or unlocks a single rapor final row.
export async function toggleRaporLockAction(
  raporFinalId: string,
  isLocked: boolean,
  academicYearId: string,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = LockRaporSchema.safeParse({ raporFinalId, isLocked });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.toggleRaporLockStatus(parsed.data.raporFinalId, parsed.data.isLocked);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/admin/rapor/${academicYearId}`);
  return ok(isLocked ? "Rapor dikunci." : "Rapor dibuka.");
}
