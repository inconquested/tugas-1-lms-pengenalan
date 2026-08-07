"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { ActionButton } from "@/components/app/action-button";
import { ConfirmButton } from "@/components/app/confirm-button";
import { Button } from "@/components/ui/button";
import { approveTeacherAction, rejectTeacherAction } from "@/lib/actions/users";

export function TeacherRequestActions({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <ActionButton
        action={approveTeacherAction.bind(null, userId)}
        variant="default"
        size="sm"
      >
        <CheckIcon aria-hidden="true" />
        Setujui
      </ActionButton>
      <ConfirmButton
        action={rejectTeacherAction.bind(null, userId)}
        title="Tolak pendaftaran guru?"
        description={`${name} akan tetap terdaftar sebagai siswa.`}
        confirmLabel="Tolak"
        trigger={(open) => (
          <Button variant="outline" size="sm" onPress={open}>
            <XIcon aria-hidden="true" />
            Tolak
          </Button>
        )}
      />
    </div>
  );
}
