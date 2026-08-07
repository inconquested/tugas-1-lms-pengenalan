import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PaperclipIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/app/page-header";
import { GradeBadge } from "@/components/app/grade-badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { formatDateTime, fileLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Pratinjau Pengumpulan" };

// Full-page fallback for the submission preview (direct link / refresh).
export default async function SubmissionPreviewPage({
  params,
}: {
  params: Promise<{
    classSubjectId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}) {
  await requireRole("GURU");
  const { classSubjectId, assignmentId, submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true },
  });
  if (!submission) notFound();
  const base = `/guru/classes/${classSubjectId}/assignments/${assignmentId}`;

  return (
    <>
      <PageHeader
        title={`Pengumpulan ${submission.student.name}`}
        description={`Dikumpulkan ${formatDateTime(submission.submittedAt)}`}
      >
        <LinkButton href={base} variant="outline">
          <ArrowLeftIcon aria-hidden="true" />
          Kembali ke koreksi
        </LinkButton>
      </PageHeader>

      <Card>
        <CardContent className="grid gap-4 py-2 text-sm">
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Berkas</span>
            <Attachment className="w-full max-w-sm">
              <AttachmentMedia>
                <PaperclipIcon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{fileLabel(submission.filePath)}</AttachmentTitle>
                <AttachmentDescription>Buka berkas di tab baru</AttachmentDescription>
              </AttachmentContent>
              <AttachmentTrigger
                render={(props) => (
                  <a
                    {...props}
                    href={submission.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka berkas ${fileLabel(submission.filePath)}`}
                  />
                )}
              />
            </Attachment>
          </div>
          <div className="grid gap-1.5">
            <span className="text-muted-foreground">Nilai saat ini</span>
            <div>
              <GradeBadge score={submission.grade} />
            </div>
          </div>
          {submission.feedback ? (
            <div className="grid gap-1.5">
              <span className="text-muted-foreground">Umpan balik</span>
              <p className="whitespace-pre-line">{submission.feedback}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
