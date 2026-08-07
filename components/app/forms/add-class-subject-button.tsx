"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/app/form-dialog";
import { ClassSubjectForm } from "@/components/app/forms/class-subject-form";
import type { SelectOption } from "@/components/app/form-select";

export function AddClassSubjectButton({
  classId,
  subjects,
  teachers,
}: {
  classId: string;
  subjects: SelectOption[];
  teachers: SelectOption[];
}) {
  return (
    <FormDialog
      title="Tambah mata pelajaran"
      description="Plot mata pelajaran ke kelas ini dan tentukan gurunya."
      trigger={(open) => (
        <Button onPress={open}>
          <PlusIcon aria-hidden="true" />
          Tambah mapel
        </Button>
      )}
    >
      {(close) => (
        <ClassSubjectForm
          classId={classId}
          subjects={subjects}
          teachers={teachers}
          onDone={close}
        />
      )}
    </FormDialog>
  );
}
