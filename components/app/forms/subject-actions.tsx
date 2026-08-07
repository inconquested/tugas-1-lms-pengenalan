"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/app/form-dialog";
import { ConfirmButton } from "@/components/app/confirm-button";
import { SubjectForm } from "@/components/app/forms/subject-form";
import { deleteSubjectAction } from "@/lib/actions/subjects";
import type { Subject } from "@/app/generated/prisma/client";

export function CreateSubjectButton() {
  return (
    <FormDialog
      title="Tambah mata pelajaran"
      description="Buat mata pelajaran baru untuk dipakai di kelas."
      trigger={(open) => (
        <Button onPress={open}>
          <PlusIcon aria-hidden="true" />
          Tambah
        </Button>
      )}
    >
      {(close) => <SubjectForm onDone={close} />}
    </FormDialog>
  );
}

export function SubjectRowActions({ subject }: { subject: Subject }) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Edit mata pelajaran"
        trigger={(open) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${subject.name}`}
            onPress={open}
          >
            <PencilIcon aria-hidden="true" />
          </Button>
        )}
      >
        {(close) => <SubjectForm subject={subject} onDone={close} />}
      </FormDialog>
      <ConfirmButton
        action={deleteSubjectAction.bind(null, subject.id)}
        title="Hapus mata pelajaran?"
        description={`"${subject.name}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        trigger={(open) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Hapus ${subject.name}`}
            onPress={open}
          >
            <Trash2Icon aria-hidden="true" />
          </Button>
        )}
      />
    </div>
  );
}
