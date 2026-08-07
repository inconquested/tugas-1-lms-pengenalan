"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { CreateClassSchema, JoinClassByCodeSchema, JoinHomeroomByCodeSchema } from "@/lib/validations/class.schema";
import { CreateClassSubjectSchema, JoinSubjectByCodeSchema } from "@/lib/validations/class-subject.schema";
import * as svc from "@/lib/services/class.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str } from "@/lib/actions/form";

// ── Admin: build classes and subject slots ──────────────────────────────────

export async function createClassAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = CreateClassSchema.safeParse({
    name: str(formData.get("name")),
    academicYearId: str(formData.get("academicYearId")),
    homeroomTeacherId: str(formData.get("homeroomTeacherId")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.createClass(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/classes");
  revalidatePath("/admin");
  return ok("Kelas ditambahkan.");
}

export async function createClassSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const classId = str(formData.get("classId"));
  const parsed = CreateClassSubjectSchema.safeParse({
    classId,
    subjectId: str(formData.get("subjectId")),
    teacherId: str(formData.get("teacherId")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.createClassSubject(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  if (classId) revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin/classes"); // list shows the per-class mapel count
  return ok("Mata pelajaran ditambahkan ke kelas.");
}

// ── Guru: claim a subject slot or a homeroom by code ─────────────────────────

export async function claimSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireRole("GURU");
  const parsed = JoinSubjectByCodeSchema.safeParse({
    teacherJoinCode: str(formData.get("teacherJoinCode")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.claimSubjectByCode(teacher.id, parsed.data.teacherJoinCode);
  } catch (e) {
    return fromError(e);
  }
  // Revalidate the whole /guru segment (dashboard, classes list, sidebar) then land on the
  // classes list so the newly claimed subject renders immediately without a manual refresh.
  revalidatePath("/guru", "layout");
  redirect("/guru/classes");
}

export async function claimHomeroomAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teacher = await requireRole("GURU");
  const parsed = JoinHomeroomByCodeSchema.safeParse({
    homeroomJoinCode: str(formData.get("homeroomJoinCode")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.claimHomeroomByCode(teacher.id, parsed.data.homeroomJoinCode);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/guru", "layout");
  redirect("/guru/classes");
}

// ── Siswa: self-enroll by class code ─────────────────────────────────────────

export async function enrollByCodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const student = await requireRole("SISWA");
  const parsed = JoinClassByCodeSchema.safeParse({
    studentJoinCode: str(formData.get("studentJoinCode")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.enrollStudentByCode(student.id, parsed.data.studentJoinCode);
  } catch (e) {
    return fromError(e);
  }
  // Revalidate the whole /siswa segment (dashboard, classes list, sidebar) then land on the
  // classes list so the joined class hydrates instantly without a stale client-side view.
  revalidatePath("/siswa", "layout");
  redirect("/siswa/classes");
}
