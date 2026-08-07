"use client";

import { useActionState } from "react";
import { createClassSubjectAction } from "@/lib/actions/classes";
import { idle } from "@/lib/actions/types";
import { FormSelect, type SelectOption } from "@/components/app/form-select";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Button } from "@/components/ui/button";

export function ClassSubjectForm({
  classId,
  subjects,
  teachers,
  onDone,
}: {
  classId: string;
  subjects: SelectOption[];
  teachers: SelectOption[];
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(createClassSubjectAction, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="classId" value={classId} />
      <FormSelect
        name="subjectId"
        label="Mata pelajaran"
        options={subjects}
        error={state.errors?.subjectId}
        required
      />
      <FormSelect
        name="teacherId"
        label="Guru pengampu"
        options={teachers}
        placeholder="Belum ditentukan"
        description="Opsional. Guru dapat mengeklaim lewat kode guru."
        error={state.errors?.teacherId}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onPress={onDone}>
          Batal
        </Button>
        <SubmitButton pendingLabel="Menyimpan...">Tambah mapel</SubmitButton>
      </div>
    </form>
  );
}
