"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  CreateSubmissionSchema,
  GradeSubmissionSchema,
} from "@/lib/validations/submission.schema";
import * as svc from "@/lib/services/submission.service";
import { type ActionState, ok, fromZod, fromError } from "@/lib/actions/types";
import { str, num } from "@/lib/actions/form";

// Student uploads / re-uploads their work. `filePath` is the stored asset reference
// (Cloudinary URL once wired); here it accepts a link or file reference.
export async function submitAssignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const student = await requireRole("SISWA");
  const assignmentId = str(formData.get("assignmentId"));
  const classSubjectId = str(formData.get("classSubjectId"));
  const parsed = CreateSubmissionSchema.safeParse({
    assignmentId,
    studentId: student.id,
    filePath: str(formData.get("filePath")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.submitAssignment(parsed.data);
  } catch (e) {
    return fromError(e);
  }
  if (classSubjectId && assignmentId) {
    revalidatePath(`/siswa/classes/${classSubjectId}/assignments/${assignmentId}`);
  }
  return ok("Pengumpulan tugas berhasil disimpan.");
}

// Teacher grades one submission with an optional inline feedback note.
export async function gradeSubmissionAction(
  submissionId: string,
  classSubjectId: string,
  assignmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("GURU");
  const parsed = GradeSubmissionSchema.safeParse({
    grade: num(formData.get("grade")),
    feedback: str(formData.get("feedback")),
  });
  if (!parsed.success) return fromZod(parsed.error);
  try {
    await svc.gradeSubmission(submissionId, parsed.data.grade, parsed.data.feedback);
  } catch (e) {
    return fromError(e);
  }
  revalidatePath(`/guru/classes/${classSubjectId}/assignments/${assignmentId}`);
  return ok("Nilai tersimpan.");
}
