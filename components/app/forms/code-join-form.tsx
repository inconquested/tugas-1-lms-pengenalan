"use client";

import { useActionState, useId } from "react";
import { idle, type ActionState } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";

// Generic "join by code" form (student enroll, teacher claim subject / homeroom).
export function CodeJoinForm({
  action,
  name,
  label,
  description,
  placeholder,
  submitLabel = "Gabung",
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  const uid = useId();
  const [state, formAction] = useActionState(action, idle);
  useActionToast(state);

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label={label}
        htmlFor={`${uid}-code`}
        error={state.errors?.[name]}
        description={description}
        required
      >
        <Input name={name} placeholder={placeholder} autoComplete="off" />
      </Field>
      <SubmitButton pendingLabel="Memproses...">{submitLabel}</SubmitButton>
    </form>
  );
}
