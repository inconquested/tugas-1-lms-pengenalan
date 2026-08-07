import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAssignmentById } from "@/lib/services/assignment.service";
import { formatDate, gradeBand } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { GradeBadge } from "@/components/app/grade-badge";
import { MaterialViewer } from "@/components/app/material-viewer";
import { SubmissionForm } from "@/components/app/forms/submission-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Detail Tugas" };

export default async function SiswaAssignmentPage({
  params,
}: {
  params: Promise<{ classSubjectId: string; assignmentId: string }>;
}) {
  const user = await requireRole("SISWA");
  const { classSubjectId, assignmentId } = await params;

  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) notFound();

  const submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
  });

  return (
    <>
      <PageHeader
        title={assignment.title}
        description={`Tenggat: ${
          assignment.dueDate ? formatDate(assignment.dueDate) : "Tanpa batas"
        }`}
      >
        {submission ? (
          submission.grade != null ? (
            <GradeBadge score={submission.grade} />
          ) : (
            <Badge variant="info">Sudah dikumpulkan</Badge>
          )
        ) : (
          <Badge variant="outline">Belum dikumpulkan</Badge>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 gap-6">
          {/* Materi front and center: students study the content inside the LMS. */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                Materi pembelajaran
              </CardTitle>
              <CardDescription>
                Pelajari materi langsung di sini, lalu kumpulkan tugasmu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialViewer references={assignment.externalReferences} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruksi tugas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              {assignment.description ? (
                <p className="whitespace-pre-line text-muted-foreground">
                  {assignment.description}
                </p>
              ) : (
                <p className="text-muted-foreground">Tidak ada deskripsi.</p>
              )}

              {assignment.additionalNote ? (
                <div className="grid gap-1">
                  <span className="font-medium">Catatan tambahan</span>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {assignment.additionalNote}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Pengumpulan</CardTitle>
              <CardDescription>
                Kirim tautan atau nama berkas tugas kamu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionForm
                assignmentId={assignmentId}
                classSubjectId={classSubjectId}
                defaultFilePath={submission?.filePath}
                hasSubmission={!!submission}
              />
            </CardContent>
          </Card>

          {submission && submission.grade != null ? (
            <Card>
              <CardHeader>
                <CardTitle>Nilai & Umpan Balik</CardTitle>
                <CardAction>
                  <GradeBadge score={submission.grade} />
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <span className="text-muted-foreground">
                  {gradeBand(submission.grade).label}
                </span>
                {submission.feedback ? (
                  <p className="whitespace-pre-line">{submission.feedback}</p>
                ) : (
                  <p className="text-muted-foreground">Belum ada umpan balik.</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
