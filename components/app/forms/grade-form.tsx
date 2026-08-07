"use client";

import { useActionState, useId } from "react";
import { gradeSubmissionAction } from "@/lib/actions/submissions";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Inline grade + feedback form shown on each submission in the grading view.
export function GradeForm({
  submissionId,
  classSubjectId,
  assignmentId,
  grade,
  feedback,
}: {
  submissionId: string;
  classSubjectId: string;
  assignmentId: string;
  grade: number | null;
  feedback: string | null;
}) {
  const uid = useId();
  const action = gradeSubmissionAction.bind(
    null,
    submissionId,
    classSubjectId,
    assignmentId,
  );
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state);

  return (
    <form
      action={formAction}
      className="grid gap-3 sm:grid-cols-[7rem_1fr_auto] sm:items-start"
    >
      <Field label="Nilai" htmlFor={`${uid}-grade`} error={state.errors?.grade}>
        <Input
          type="number"
          name="grade"
          min={0}
          max={100}
          step={1}
          inputMode="numeric"
          defaultValue={grade ?? ""}
        />
      </Field>
      <Field
        label="Umpan balik"
        htmlFor={`${uid}-feedback`}
        error={state.errors?.feedback}
      >
        <Textarea
          name="feedback"
          rows={2}
          defaultValue={feedback ?? ""}
          placeholder="Catatan untuk siswa (opsional)"
        />
      </Field>
      <div className="sm:pt-7">
        <SubmitButton pendingLabel="Menyimpan...">Simpan nilai</SubmitButton>
      </div>
    </form>
  );
}
