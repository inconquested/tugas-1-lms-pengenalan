"use client";

import { useActionState, useId } from "react";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { FormSelect } from "@/components/app/form-select";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/app/generated/prisma/client";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "GURU", label: "Guru" },
  { value: "SISWA", label: "Siswa" },
];

export function UserForm({
  user,
  onDone,
}: {
  user?: User;
  onDone: () => void;
}) {
  const uid = useId();
  const action = user
    ? updateUserAction.bind(null, user.id)
    : createUserAction;
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state, onDone);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Nama lengkap"
        htmlFor={`${uid}-name`}
        error={state.errors?.name}
        required
      >
        <Input name="name" defaultValue={user?.name} placeholder="Budi Santoso" />
      </Field>
      <Field
        label="Email"
        htmlFor={`${uid}-email`}
        error={state.errors?.email}
        required
      >
        <Input
          type="email"
          name="email"
          defaultValue={user?.email}
          placeholder="budi@sekolah.sch.id"
        />
      </Field>
      <FormSelect
        name="role"
        label="Peran"
        options={ROLE_OPTIONS}
        defaultValue={user?.role ?? "SISWA"}
        error={state.errors?.role}
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onPress={onDone}>
          Batal
        </Button>
        <SubmitButton pendingLabel="Menyimpan...">
          {user ? "Simpan perubahan" : "Tambah"}
        </SubmitButton>
      </div>
    </form>
  );
}
