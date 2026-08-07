"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  CreateAcademicYearSchema,
  UpdateAcademicYearSchema,
} from "@/lib/validations/academic-year.schema";
import * as svc from "@/lib/services/academic-year.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str, bool } from "@/lib/actions/form";

export async function createAcademicYearAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = CreateAcademicYearSchema.safeParse({
    year: str(formData.get("year")),
    semester: str(formData.get("semester")),
    isActive: bool(formData.get("isActive")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    const created = await svc.createAcademicYear({ ...parsed.data, isActive: false });
    if (parsed.data.isActive) await svc.setActiveAcademicYear(created.id);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/academic-years");
  revalidatePath("/admin");
  return ok("Tahun ajaran ditambahkan.");
}

export async function updateAcademicYearAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = UpdateAcademicYearSchema.safeParse({
    year: str(formData.get("year")),
    semester: str(formData.get("semester")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.updateAcademicYear(id, parsed.data);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/academic-years");
  return ok("Tahun ajaran diperbarui.");
}

export async function setActiveAcademicYearAction(id: string): Promise<ActionState> {
  await requireRole("ADMIN");
  try {
    await svc.setActiveAcademicYear(id);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/academic-years");
  revalidatePath("/admin");
  return ok("Tahun ajaran aktif diperbarui.");
}

export async function deleteAcademicYearAction(id: string): Promise<ActionState> {
  await requireRole("ADMIN");
  try {
    await svc.deleteAcademicYear(id);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath("/admin/academic-years");
  return ok("Tahun ajaran dihapus.");
}
