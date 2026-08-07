import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, InboxIcon, LibraryIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAssignmentById } from "@/lib/services/assignment.service";
import { getSubmissionsByAssignment } from "@/lib/services/submission.service";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { GradeForm } from "@/components/app/forms/grade-form";
import { MaterialViewer } from "@/components/app/material-viewer";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { formatDateTime, formatScore } from "@/lib/format";

export const metadata: Metadata = { title: "Koreksi Tugas" };

export default async function AssignmentGradingPage({
  params,
}: {
  params: Promise<{ classSubjectId: string; assignmentId: string }>;
}) {
  await requireRole("GURU");
  const { classSubjectId, assignmentId } = await params;

  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) notFound();
  const submissions = await getSubmissionsByAssignment(assignmentId);
  const base = `/guru/classes/${classSubjectId}/assignments/${assignmentId}`;
  const graded = submissions.filter((s) => s.grade !== null).length;

  return (
    <>
      <PageHeader
        title={assignment.title}
        description="Koreksi dan nilai pengumpulan siswa (0 sampai 100)."
      >
        <LinkButton
          href={`/guru/classes/${classSubjectId}/assignments`}
          variant="outline"
        >
          <ArrowLeftIcon aria-hidden="true" />
          Daftar tugas
        </LinkButton>
      </PageHeader>

      {assignment.externalReferences.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LibraryIcon
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              Materi yang dibagikan
            </CardTitle>
            <CardDescription>
              Tampilan materi yang dilihat siswa di dalam LMS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MaterialViewer references={assignment.externalReferences} />
          </CardContent>
        </Card>
      ) : null}

      {submissions.length > 0 ? (
        <Progress
          value={graded}
          maxValue={submissions.length}
          className="rounded-xl border border-border bg-card p-4"
        >
          <ProgressLabel className="text-muted-foreground">
            Progres penilaian
          </ProgressLabel>
          <span className="ml-auto text-sm font-medium tabular-nums">
            {graded}/{submissions.length} dinilai
          </span>
        </Progress>
      ) : null}

      {submissions.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Belum ada pengumpulan"
          description="Nilai akan muncul di sini setelah siswa mengumpulkan tugas."
        />
      ) : (
        <ul className="grid gap-4">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{submission.student.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Dikumpulkan {formatDateTime(submission.submittedAt)}</span>
                    {submission.grade === null ? (
                      <Badge variant="outline">Belum dinilai</Badge>
                    ) : (
                      <Badge variant="secondary">
                        Nilai {formatScore(submission.grade)}
                      </Badge>
                    )}
                  </div>
                  <CardAction>
                    <LinkButton
                      href={`${base}/s/${submission.id}`}
                      variant="ghost"
                      size="sm"
                    >
                      <EyeIcon aria-hidden="true" />
                      Pratinjau
                    </LinkButton>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <GradeForm
                    submissionId={submission.id}
                    classSubjectId={classSubjectId}
                    assignmentId={assignmentId}
                    grade={submission.grade}
                    feedback={submission.feedback}
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
