import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  UserRoundIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAssignmentsByClassSubject } from "@/lib/services/assignment.service";
import { formatDate, semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { GradeBadge } from "@/components/app/grade-badge";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Detail Mata Pelajaran" };

export default async function SiswaClassSubjectPage({
  params,
}: {
  params: Promise<{ classSubjectId: string }>;
}) {
  const user = await requireRole("SISWA");
  const { classSubjectId } = await params;

  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: {
      subject: true,
      teacher: true,
      class: { include: { academicYear: true } },
    },
  });
  if (!classSubject) notFound();

  const assignments = await getAssignmentsByClassSubject(classSubjectId);

  // The student's own submissions, so each assignment can carry a real status.
  const submissions = await prisma.submission.findMany({
    where: {
      studentId: user.id,
      assignmentId: { in: assignments.map((a) => a.id) },
    },
    select: { assignmentId: true, grade: true },
  });
  const submissionByAssignment = new Map(
    submissions.map((s) => [s.assignmentId, s]),
  );
  const now = new Date();
  const submittedCount = submissions.length;
  const gradedCount = submissions.filter((s) => s.grade !== null).length;

  return (
    <>
      <PageHeader
        icon={BookOpenIcon}
        title={classSubject.subject.name}
        description={`${classSubject.class.name} - ${classSubject.class.academicYear.year} - Semester ${semesterLabel(
          classSubject.class.academicYear.semester,
        )}`}
      >
        <LinkButton href="/siswa/classes" variant="outline">
          <ArrowLeftIcon aria-hidden="true" />
          Kembali
        </LinkButton>
      </PageHeader>

      <Card>
        <CardContent className="flex items-center gap-3 py-1">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRoundIcon className="size-4.5" aria-hidden="true" />
          </span>
          <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">Guru pengampu</span>
            <span className="font-medium">
              {classSubject.teacher?.name ?? "Belum ada guru"}
            </span>
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Tugas"
            value={assignments.length}
            icon={ClipboardListIcon}
          />
          <StatCard
            label="Sudah Dikumpulkan"
            value={submittedCount}
            icon={CheckCircle2Icon}
          />
          <StatCard
            label="Sudah Dinilai"
            value={gradedCount}
            icon={ClipboardCheckIcon}
          />
        </div>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Tugas
        </h2>
        {assignments.length === 0 ? (
          <EmptyState
            icon={ClipboardListIcon}
            title="Belum ada tugas"
            description="Guru belum menambahkan tugas untuk mata pelajaran ini."
          />
        ) : (
          <div className="grid gap-3">
            {assignments.map((a) => {
              const sub = submissionByAssignment.get(a.id);
              const overdue = !sub && a.dueDate != null && a.dueDate < now;
              return (
                <Link
                  key={a.id}
                  href={`/siswa/classes/${classSubjectId}/assignments/${a.id}`}
                  className="group block"
                >
                  <Card className="transition-[transform,box-shadow,--tw-ring-color] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-foreground/15">
                    <CardContent className="flex items-start justify-between gap-4 py-1">
                      <div className="grid min-w-0 gap-1">
                        <div className="flex items-center gap-2">
                          <ClipboardListIcon
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="truncate font-medium">{a.title}</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClockIcon
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Tenggat:{" "}
                          {a.dueDate ? formatDate(a.dueDate) : "Tanpa batas"}
                        </span>
                        {a.description ? (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {a.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {sub && sub.grade !== null ? (
                          <GradeBadge score={sub.grade} />
                        ) : sub ? (
                          <Badge variant="info">Terkumpul</Badge>
                        ) : overdue ? (
                          <Badge variant="destructive">Terlambat</Badge>
                        ) : (
                          <Badge variant="outline">Belum dikumpulkan</Badge>
                        )}
                        <ChevronRightIcon
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
