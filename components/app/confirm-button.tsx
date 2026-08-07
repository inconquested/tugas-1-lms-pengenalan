"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ActionState } from "@/lib/actions/types";
import type * as React from "react";

// Guards a (usually destructive) bound Server Action behind an alertdialog
// confirmation. `trigger` receives an opener so callers control the trigger UI.
export function ConfirmButton({
  action,
  trigger,
  title,
  description,
  confirmLabel = "Hapus",
  confirmVariant = "destructive",
}: {
  action: () => Promise<ActionState>;
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      {trigger(() => setOpen(true))}
      <AlertDialog isOpen={open} onOpenChange={setOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onPress={() => setOpen(false)} isDisabled={pending}>
            Batal
          </Button>
          <Button
            variant={confirmVariant}
            isDisabled={pending}
            onPress={() =>
              start(async () => {
                const res = await action();
                if (res.ok) {
                  toast.success(res.message ?? "Berhasil.");
                  setOpen(false);
                } else {
                  toast.error(res.message ?? "Gagal.");
                }
              })
            }
          >
            {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </>
  );
}
