"use client";

import { useActionState, useId } from "react";
import {
  createAcademicYearAction,
  updateAcademicYearAction,
} from "@/lib/actions/academic-years";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { FormSelect } from "@/components/app/form-select";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { AcademicYear } from "@/app/generated/prisma/client";

const SEMESTER_OPTIONS = [
  { value: "GANJIL", label: "Ganjil" },
  { value: "GENAP", label: "Genap" },
];

export function AcademicYearForm({
  academicYear,
  onDone,
}: {
  academicYear?: AcademicYear;
  onDone: () => void;
}) {
  const uid = useId();
  const action = academicYear
    ? updateAcademicYearAction.bind(null, academicYear.id)
    : createAcademicYearAction;
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Tahun ajaran"
        htmlFor={`${uid}-year`}
        error={state.errors?.year}
        description="Format YYYY/YYYY, mis. 2025/2026."
        required
      >
        <Input
          name="year"
          defaultValue={academicYear?.year}
          placeholder="2025/2026"
        />
      </Field>
      <FormSelect
        name="semester"
        label="Semester"
        options={SEMESTER_OPTIONS}
        defaultValue={academicYear?.semester ?? "GANJIL"}
        error={state.errors?.semester}
        required
      />
      {academicYear ? null : (
        <Checkbox name="isActive" value="true">
          Jadikan tahun ajaran aktif
        </Checkbox>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onPress={onDone}>
          Batal
        </Button>
        <SubmitButton pendingLabel="Menyimpan...">
          {academicYear ? "Simpan perubahan" : "Tambah"}
        </SubmitButton>
      </div>
    </form>
  );
}
