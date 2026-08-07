"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/app/form-dialog";
import { ConfirmButton } from "@/components/app/confirm-button";
import { ActionButton } from "@/components/app/action-button";
import { AcademicYearForm } from "@/components/app/forms/academic-year-form";
import {
  deleteAcademicYearAction,
  setActiveAcademicYearAction,
} from "@/lib/actions/academic-years";
import type { AcademicYear } from "@/app/generated/prisma/client";

export function CreateAcademicYearButton() {
  return (
    <FormDialog
      title="Tambah tahun ajaran"
      description="Buat periode tahun ajaran dan semester baru."
      trigger={(open) => (
        <Button onPress={open}>
          <PlusIcon aria-hidden="true" />
          Tambah
        </Button>
      )}
    >
      {(close) => <AcademicYearForm onDone={close} />}
    </FormDialog>
  );
}

export function AcademicYearRowActions({
  academicYear,
}: {
  academicYear: AcademicYear;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {academicYear.isActive ? null : (
        <ActionButton
          action={setActiveAcademicYearAction.bind(null, academicYear.id)}
        >
          Jadikan aktif
        </ActionButton>
      )}
      <FormDialog
        title="Edit tahun ajaran"
        trigger={(open) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit tahun ajaran ${academicYear.year}`}
            onPress={open}
          >
            <PencilIcon aria-hidden="true" />
          </Button>
        )}
      >
        {(close) => (
          <AcademicYearForm academicYear={academicYear} onDone={close} />
        )}
      </FormDialog>
      <ConfirmButton
        action={deleteAcademicYearAction.bind(null, academicYear.id)}
        title="Hapus tahun ajaran?"
        description={`Tahun ajaran ${academicYear.year} akan dihapus permanen beserta seluruh relasinya.`}
        trigger={(open) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Hapus tahun ajaran ${academicYear.year}`}
            onPress={open}
          >
            <Trash2Icon aria-hidden="true" />
          </Button>
        )}
      />
    </div>
  );
}
