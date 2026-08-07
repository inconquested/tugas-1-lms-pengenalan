"use client";

import { useActionState, useId } from "react";
import { createClassAction } from "@/lib/actions/classes";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { FormSelect, type SelectOption } from "@/components/app/form-select";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ClassForm({
  years,
  teachers,
  defaultYearId,
  onDone,
}: {
  years: SelectOption[];
  teachers: SelectOption[];
  defaultYearId?: string;
  onDone: () => void;
}) {
  const uid = useId();
  const [state, formAction] = useActionState(createClassAction, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Nama kelas"
        htmlFor={`${uid}-name`}
        error={state.errors?.name}
        required
      >
        <Input name="name" placeholder="XII IPA 1" />
      </Field>
      <FormSelect
        name="academicYearId"
        label="Tahun ajaran"
        options={years}
        defaultValue={defaultYearId}
        error={state.errors?.academicYearId}
        required
      />
      <FormSelect
        name="homeroomTeacherId"
        label="Wali kelas"
        options={teachers}
        placeholder="Belum ditentukan"
        description="Opsional. Bisa diisi nanti lewat kode wali kelas."
        error={state.errors?.homeroomTeacherId}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onPress={onDone}>
          Batal
        </Button>
        <SubmitButton pendingLabel="Menyimpan...">Tambah</SubmitButton>
      </div>
    </form>
  );
}
