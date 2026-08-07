"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarClockIcon,
  InboxIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssignmentForm } from "@/components/app/forms/assignment-form";
import { deleteAssignmentAction } from "@/lib/actions/assignments";
import { formatDate } from "@/lib/format";

// Serializable shape the grid hands each card. `dueDate` is an ISO string so it
// crosses the server→client boundary cleanly and doubles as the edit form's value.
export type AssignmentCardData = {
  id: string;
  title: string;
  description: string | null;
  additionalNote: string | null;
  dueDate: string | null;
  externalReferences: string[];
  submissionCount: number;
  studentCount: number;
  href: string;
};

const DAY = 86_400_000;

/** Due-date → badge label + variant, derived from a server-supplied `nowMs` so it
 *  never disagrees with the server render on hydration. */
function dueStatus(dueDate: string | null, nowMs: number) {
  if (!dueDate) return { label: "Tanpa batas", variant: "outline" as const };
  const diff = new Date(dueDate).getTime() - nowMs;
  if (diff < 0) return { label: "Terlambat", variant: "destructive" as const };
  const days = Math.ceil(diff / DAY);
  if (days <= 3) {
    return {
      label: days <= 1 ? "Jatuh tempo hari ini" : `Segera · ${days} hari`,
      variant: "warning" as const,
    };
  }
  return { label: "Terjadwal", variant: "info" as const };
}

export function AssignmentCard({
  data,
  classSubjectId,
  nowMs,
}: {
  data: AssignmentCardData;
  classSubjectId: string;
  nowMs: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startDelete] = useTransition();

  const status = dueStatus(data.dueDate, nowMs);

  function onDelete() {
    startDelete(async () => {
      const res = await deleteAssignmentAction(data.id, classSubjectId);
      if (res.ok) {
        toast.success(res.message ?? "Tugas dihapus.");
        setDeleteOpen(false);
      } else {
        toast.error(res.message ?? "Gagal menghapus tugas.");
      }
    });
  }

  return (
    <>
      <Card className="relative flex h-full flex-col transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <CardHeader>
          <CardTitle>
            {/* Stretched link: the whole card navigates; the menu (z-10) opts back out. */}
            <Link
              href={data.href}
              className="underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:underline"
            >
              {data.title}
            </Link>
          </CardTitle>
          <CardAction>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Aksi untuk ${data.title}`}
                className="relative z-10"
              >
                <MoreVerticalIcon aria-hidden="true" />
              </Button>
              <DropdownMenu placement="bottom end" className="min-w-40">
                <DropdownMenuItem onAction={() => setEditOpen(true)}>
                  <PencilIcon aria-hidden="true" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onAction={() => setDeleteOpen(true)}
                >
                  <Trash2Icon aria-hidden="true" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClockIcon className="size-3.5" aria-hidden="true" />
              {data.dueDate ? formatDate(data.dueDate) : "Tanpa batas"}
            </span>
          </div>

          {data.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {data.description}
            </p>
          ) : null}

          <div className="mt-auto pt-1">
            <Progress
              value={data.submissionCount}
              maxValue={Math.max(data.studentCount, 1)}
              aria-label="Progres pengumpulan"
              className="gap-1.5"
            >
              <ProgressLabel className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <InboxIcon className="size-3.5" aria-hidden="true" />
                Pengumpulan
              </ProgressLabel>
              <ProgressValue className="text-xs tabular-nums">
                {() => `${data.submissionCount}/${data.studentCount}`}
              </ProgressValue>
            </Progress>
          </div>
        </CardContent>
      </Card>

      {/* Edit — updates in place then closes, mirroring the row-action dialog. */}
      <Dialog isOpen={editOpen} onOpenChange={setEditOpen} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit tugas</DialogTitle>
          <DialogDescription>
            Perbarui detail tugas. Perubahan langsung terlihat oleh siswa.
          </DialogDescription>
        </DialogHeader>
        <AssignmentForm
          classSubjectId={classSubjectId}
          assignment={data}
          onDone={() => setEditOpen(false)}
        />
      </Dialog>

      {/* Delete — guarded confirm. */}
      <AlertDialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus tugas?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{data.title}&quot; beserta seluruh pengumpulannya akan dihapus
            permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onPress={() => setDeleteOpen(false)}
            isDisabled={pending}
          >
            Batal
          </Button>
          <Button variant="destructive" isDisabled={pending} onPress={onDelete}>
            {pending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : null}
            Hapus
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </>
  );
}
