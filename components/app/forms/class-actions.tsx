"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/app/form-dialog";
import { ClassForm } from "@/components/app/forms/class-form";
import type { SelectOption } from "@/components/app/form-select";

export function CreateClassButton({
  years,
  teachers,
  defaultYearId,
}: {
  years: SelectOption[];
  teachers: SelectOption[];
  defaultYearId?: string;
}) {
  return (
    <FormDialog
      title="Tambah kelas"
      description="Buat kelas baru pada tahun ajaran terpilih."
      trigger={(open) => (
        <Button onPress={open}>
          <PlusIcon aria-hidden="true" />
          Tambah kelas
        </Button>
      )}
    >
      {(close) => (
        <ClassForm
          years={years}
          teachers={teachers}
          defaultYearId={defaultYearId}
          onDone={close}
        />
      )}
    </FormDialog>
  );
}
