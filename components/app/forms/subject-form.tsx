"use client";

import { useActionState, useId } from "react";
import { createSubjectAction, updateSubjectAction } from "@/lib/actions/subjects";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/app/generated/prisma/client";

export function SubjectForm({
  subject,
  onDone,
}: {
  subject?: Subject;
  onDone: () => void;
}) {
  const uid = useId();
  const action = subject
    ? updateSubjectAction.bind(null, subject.id)
    : createSubjectAction;
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Nama mata pelajaran"
        htmlFor={`${uid}-name`}
        error={state.errors?.name}
        required
      >
        <Input name="name" defaultValue={subject?.name} placeholder="Matematika" />
      </Field>
      <Field
        label="Kode"
        htmlFor={`${uid}-code`}
        error={state.errors?.code}
        description="Kode unik, mis. MTK atau FIS-01."
        required
      >
        <Input name="code" defaultValue={subject?.code} placeholder="MTK" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onPress={onDone}>
          Batal
        </Button>
        <SubmitButton pendingLabel="Menyimpan...">
          {subject ? "Simpan perubahan" : "Tambah"}
        </SubmitButton>
      </div>
    </form>
  );
}
