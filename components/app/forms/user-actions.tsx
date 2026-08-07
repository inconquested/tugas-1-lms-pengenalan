"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CopyIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/app/form-dialog";
import { UserForm } from "@/components/app/forms/user-form";
import type { User } from "@/app/generated/prisma/client";

export function CreateUserButton() {
  return (
    <FormDialog
      title="Tambah pengguna"
      description="Buat akun baru. Data akan disinkron dengan Clerk saat login pertama."
      trigger={(open) => (
        <Button onPress={open}>
          <PlusIcon aria-hidden="true" />
          Tambah
        </Button>
      )}
    >
      {(close) => <UserForm onDone={close} />}
    </FormDialog>
  );
}

async function copy(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  } catch {
    toast.error("Gagal menyalin.");
  }
}

/**
 * Hover-revealed action cluster for a directory row: a compact menu that keeps the
 * real, available operations (edit, copy contact) one click away. Edit opens the
 * pre-filled form in a controlled dialog the menu hands off to.
 */
export function UserContactActions({ user }: { user: User }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Aksi untuk ${user.name}`}
          className="text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100 data-pressed:opacity-100 sm:opacity-0"
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </Button>
        <DropdownMenu placement="bottom end" className="min-w-44">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onAction={() => setEditOpen(true)}>
            <PencilIcon aria-hidden="true" />
            Edit pengguna
          </DropdownMenuItem>
          <DropdownMenuItem
            onAction={() => copy(user.email, "Email disalin.")}
          >
            <MailIcon aria-hidden="true" />
            Salin email
          </DropdownMenuItem>
          <DropdownMenuItem
            onAction={() => copy(user.id, "ID pengguna disalin.")}
          >
            <CopyIcon aria-hidden="true" />
            Salin ID
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>

      <Dialog isOpen={editOpen} onOpenChange={setEditOpen} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit pengguna</DialogTitle>
        </DialogHeader>
        <UserForm user={user} onDone={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
}
