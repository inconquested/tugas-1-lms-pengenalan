"use client";

import { useActionState, useId } from "react";
import { updateRaporFinalAction } from "@/lib/actions/rapor";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Wali kelas row: attendance tally and a behaviour note for one student in a year.
export function RaporFinalRowForm({
  classId,
  studentId,
  academicYearId,
  attendanceSick,
  attendancePermission,
  attendanceAlpha,
  behaviorNote,
}: {
  classId: string;
  studentId: string;
  academicYearId: string;
  attendanceSick?: number;
  attendancePermission?: number;
  attendanceAlpha?: number;
  behaviorNote?: string | null;
}) {
  const uid = useId();
  const [state, formAction] = useActionState(
    updateRaporFinalAction.bind(null, classId, studentId, academicYearId),
    idle,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label="Sakit"
          htmlFor={`${uid}-sick`}
          error={state.errors?.attendanceSick}
        >
          <Input
            type="number"
            name="attendanceSick"
            min={0}
            defaultValue={attendanceSick ?? 0}
          />
        </Field>
        <Field
          label="Izin"
          htmlFor={`${uid}-permission`}
          error={state.errors?.attendancePermission}
        >
          <Input
            type="number"
            name="attendancePermission"
            min={0}
            defaultValue={attendancePermission ?? 0}
          />
        </Field>
        <Field
          label="Alpha"
          htmlFor={`${uid}-alpha`}
          error={state.errors?.attendanceAlpha}
        >
          <Input
            type="number"
            name="attendanceAlpha"
            min={0}
            defaultValue={attendanceAlpha ?? 0}
          />
        </Field>
      </div>
      <Field
        label="Catatan wali kelas"
        htmlFor={`${uid}-note`}
        error={state.errors?.behaviorNote}
      >
        <Textarea
          name="behaviorNote"
          defaultValue={behaviorNote ?? ""}
          placeholder="Catatan perkembangan dan sikap siswa."
        />
      </Field>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Menyimpan...">Simpan</SubmitButton>
      </div>
    </form>
  );
}
