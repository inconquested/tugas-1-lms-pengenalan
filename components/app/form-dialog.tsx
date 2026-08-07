"use client";

import { useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type * as React from "react";

// Controlled dialog for create/edit forms. `trigger` receives an opener and
// `children` receives a `close` callback to call after a successful submit.
export function FormDialog({
  trigger,
  title,
  description,
  children,
  className = "sm:max-w-md",
}: {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog isOpen={open} onOpenChange={setOpen} className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children(() => setOpen(false))}
      </Dialog>
    </>
  );
}
