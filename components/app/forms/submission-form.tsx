"use client";

import { useActionState, useId } from "react";
import { submitAssignmentAction } from "@/lib/actions/submissions";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";

// Student submits (or re-submits) their work for one assignment. `filePath` holds
// a link or file reference; the enclosing page prefills it when a submission exists.
export function SubmissionForm({
  assignmentId,
  classSubjectId,
  defaultFilePath,
  hasSubmission = false,
}: {
  assignmentId: string;
  classSubjectId: string;
  defaultFilePath?: string;
  hasSubmission?: boolean;
}) {
  const uid = useId();
  const [state, formAction] = useActionState(submitAssignmentAction, idle);
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Tautan atau nama berkas"
        htmlFor={`${uid}-filePath`}
        error={state.errors?.filePath}
        description="Tempel URL Google Drive/Cloudinary atau nama berkas."
        required
      >
        <Input
          name="filePath"
          defaultValue={defaultFilePath}
          placeholder="https://drive.google.com/..."
          autoComplete="off"
        />
      </Field>
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="classSubjectId" value={classSubjectId} />
      <SubmitButton pendingLabel="Mengirim...">
        {hasSubmission ? "Perbarui pengumpulan" : "Kumpulkan"}
      </SubmitButton>
    </form>
  );
}
