"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  completeStudentOnboarding,
  requestTeacherRole,
} from "@/lib/services/user.service";
import { type ActionState, fail, fromError } from "@/lib/actions/types";

// The user picks their role after signing up. Students are approved instantly;
// teachers submit a request that an admin must review.
export async function completeOnboardingAction(
  choice: "SISWA" | "GURU",
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (choice === "SISWA") {
    try {
      await completeStudentOnboarding(user.id);
    } catch (e) {
      return fromError(e);
    }
    revalidatePath("/", "layout");
    redirect("/siswa");
  }
  if (choice === "GURU") {
    try {
      await requestTeacherRole(user.id);
    } catch (e) {
      return fromError(e);
    }
    revalidatePath("/", "layout");
    redirect("/onboarding/pending");
  }
  return fail("Pilihan tidak valid.");
}
