"use client";

import { useRouter } from "next/navigation";
import { PaperclipIcon } from "lucide-react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradeBadge } from "@/components/app/grade-badge";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { formatDateTime, fileLabel } from "@/lib/format";

// Quick submission preview rendered by the @modal parallel-route slot. Closing it
// (Escape / backdrop / X) pops the intercepted route without losing the grading URL.
export function SubmissionPreviewModal({
  studentName,
  filePath,
  submittedAt,
  grade,
  feedback,
}: {
  studentName: string;
  filePath: string;
  submittedAt: Date | string;
  grade: number | null;
  feedback: string | null;
}) {
  const router = useRouter();
  return (
    <Dialog
      isOpen
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
      className="sm:max-w-lg"
    >
      <DialogHeader>
        <DialogTitle>Pengumpulan {studentName}</DialogTitle>
        <DialogDescription>
          Dikumpulkan {formatDateTime(submittedAt)}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 text-sm">
        <div className="grid gap-1.5">
          <span className="text-muted-foreground">Berkas</span>
          <Attachment className="w-full">
            <AttachmentMedia>
              <PaperclipIcon aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{fileLabel(filePath)}</AttachmentTitle>
              <AttachmentDescription>Buka berkas di tab baru</AttachmentDescription>
            </AttachmentContent>
            <AttachmentTrigger
              render={(props) => (
                <a
                  {...props}
                  href={filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buka berkas ${fileLabel(filePath)}`}
                />
              )}
            />
          </Attachment>
        </div>
        <div className="grid gap-1.5">
          <span className="text-muted-foreground">Nilai saat ini</span>
          <div>
            <GradeBadge score={grade} />
          </div>
        </div>
        {feedback ? (
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Umpan balik</span>
            <p className="whitespace-pre-line">{feedback}</p>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
