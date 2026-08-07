"use client";

import { useActionState, useId } from "react";
import {
  createAssignmentAction,
  updateAssignmentAction,
} from "@/lib/actions/assignments";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/app/date-picker";
import { MaterialComposer } from "@/components/app/forms/material-composer";
import { cn } from "@/lib/utils";

// The subset of an assignment the form needs to pre-fill for editing.
export type AssignmentInitial = {
  id: string;
  title: string;
  description: string | null;
  additionalNote: string | null;
  dueDate: Date | string | null;
  externalReferences: string[];
};

// DatePicker expects local "YYYY-MM-DDTHH:mm"; derive it from the stored Date.
function toLocalInput(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Create or edit an assignment. Create runs full-page and the action redirects to
 * the list on success (so only validation errors return as state). Edit is `assignment`
 * + `onDone`: it updates in place, toasts, and closes its dialog — with every field
 * pre-populated for an optimistic, low-friction change.
 */
export function AssignmentForm({
  classSubjectId,
  assignment,
  onDone,
}: {
  classSubjectId: string;
  assignment?: AssignmentInitial;
  onDone?: () => void;
}) {
  const uid = useId();
  const isEdit = Boolean(assignment);
  const action = assignment
    ? updateAssignmentAction.bind(null, assignment.id, classSubjectId)
    : createAssignmentAction;
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="classSubjectId" value={classSubjectId} />
      <Field
        label="Judul tugas"
        htmlFor={`${uid}-title`}
        error={state.errors?.title}
        required
      >
        <Input
          name="title"
          defaultValue={assignment?.title}
          placeholder="Contoh: Latihan Bab 1"
        />
      </Field>
      <Field
        label="Deskripsi"
        htmlFor={`${uid}-description`}
        error={state.errors?.description}
      >
        <Textarea
          name="description"
          defaultValue={assignment?.description ?? undefined}
          placeholder="Jelaskan instruksi tugas."
          className={cn("max-h-48")}
        />
      </Field>
      <Field
        label="Catatan tambahan"
        htmlFor={`${uid}-additionalNote`}
        error={state.errors?.additionalNote}
      >
        <Textarea
          name="additionalNote"
          defaultValue={assignment?.additionalNote ?? undefined}
          placeholder="Informasi opsional untuk siswa."
          className={cn("max-h-48")}
        />
      </Field>
      <Field
        label="Batas waktu"
        htmlFor={`${uid}-dueDate`}
        error={state.errors?.dueDate}
        description="Kosongkan bila tugas tanpa batas waktu."
      >
        <DatePicker name="dueDate" defaultValue={toLocalInput(assignment?.dueDate)} />
      </Field>
      <div className="grid gap-2">
        <label
          htmlFor={`${uid}-externalReferences`}
          className="text-sm font-medium"
        >
          Materi &amp; referensi
        </label>
        <p
          id={`${uid}-externalReferences-desc`}
          className="text-xs text-muted-foreground"
        >
          Pilih jenisnya, lalu seret atau tempel tautan. Gambar, video
          (YouTube/Vimeo), PDF, dan Google Drive tampil langsung di dalam LMS.
        </p>
        <MaterialComposer
          inputId={`${uid}-externalReferences`}
          describedBy={`${uid}-externalReferences-desc`}
          invalid={Boolean(state.errors?.externalReferences?.length)}
          defaultValue={assignment?.externalReferences ?? []}
        />
        {state.errors?.externalReferences?.length ? (
          <p
            id={`${uid}-externalReferences-err`}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {state.errors.externalReferences.join(" ")}
          </p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        {isEdit ? (
          <Button type="button" variant="outline" onPress={onDone}>
            Batal
          </Button>
        ) : null}
        <SubmitButton pendingLabel="Menyimpan...">
          {isEdit ? "Simpan perubahan" : "Buat tugas"}
        </SubmitButton>
      </div>
    </form>
  );
}
