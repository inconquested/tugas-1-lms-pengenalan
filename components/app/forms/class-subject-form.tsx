"use client";

import { useActionState, useId } from "react";
import { createClassSubjectAction } from "@/lib/actions/classes";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { FormSelect, type SelectOption } from "@/components/app/form-select";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const uid = useId();
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
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Jam mulai"
          htmlFor={`${uid}-start`}
          error={state.errors?.TimeStart}
          required
        >
          <Input name="TimeStart" type="time" required />
        </Field>
        <Field
          label="Jam selesai"
          htmlFor={`${uid}-end`}
          error={state.errors?.TimeEnd}
          required
        >
          <Input name="TimeEnd" type="time" required />
        </Field>
      </div>
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
