import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  SchoolIcon,
  TicketIcon,
} from "lucide-react";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getStudentProgress } from "@/lib/actions/analytics";
import { formatDate, formatScore } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { SemesterAverageChart } from "@/components/app/charts/semester-average-chart";
import { GradesOverTimeChart } from "@/components/app/charts/grades-over-time-chart";
import { SubjectRadarChart } from "@/components/app/charts/subject-radar-chart";
import { WorkloadDonut } from "@/components/app/charts/workload-donut";
import { ChartsError } from "@/components/app/charts/charts-error";
import { StudentChartsSkeleton } from "@/components/app/charts/charts-skeleton";
import { LinkButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Beranda Siswa" };

export default async function SiswaDashboardPage() {
  const user = await requireRole("SISWA");

  const enrollments = await prisma.classStudent.findMany({
    where: { studentId: user.id },
    include: {
      class: {
        include: {
          academicYear: true,
          classSubjects: { include: { subject: true } },
        },
      },
    },
  });

  const csIds = enrollments.flatMap((e) =>
    e.class.classSubjects.map((cs) => cs.id),
  );

  const [upcoming, upcomingCount, grades] = await Promise.all([
    prisma.assignment.findMany({
      where: { classSubjectId: { in: csIds }, dueDate: { gte: new Date() } },
      include: { classSubject: { include: { subject: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.assignment.count({
      where: { classSubjectId: { in: csIds }, dueDate: { gte: new Date() } },
    }),
    prisma.submission.findMany({
      where: { studentId: user.id, grade: { not: null } },
      include: {
        assignment: {
          include: { classSubject: { include: { subject: true } } },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
  ]);

  const joinButton = (
    <LinkButton href="/siswa/classes/join">
      <TicketIcon aria-hidden="true" />
      Gabung kelas
    </LinkButton>
  );

  return (
    <>
      <PageHeader
        title={`Halo, ${user.name}`}
        description="Ringkasan kelas, tugas mendatang, dan nilai terbaru kamu."
      >
        {joinButton}
      </PageHeader>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="Belum ada kelas"
          description="Kamu belum bergabung ke kelas mana pun. Minta kode kelas kepada guru untuk mulai belajar."
          action={joinButton}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Kelas Diikuti"
              value={enrollments.length}
              icon={SchoolIcon}
            />
            <StatCard
              label="Mata Pelajaran"
              value={csIds.length}
              icon={BookOpenIcon}
            />
            <StatCard
              label="Tugas Mendatang"
              value={upcomingCount}
              icon={CalendarClockIcon}
            />
          </div>

          <section className="grid gap-4">
            <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
              Progres Akademik
            </h2>
            <Suspense fallback={<StudentChartsSkeleton />}>
              <StudentCharts />
            </Suspense>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tugas Mendatang</CardTitle>
                <CardDescription>
                  Tenggat terdekat dari seluruh kelas kamu.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={CalendarClockIcon}
                    title="Tidak ada tugas mendatang"
                    description="Kamu sudah bebas dari tenggat untuk saat ini."
                    compact
                  />
                ) : (
                  upcoming.map((a) => (
                    <Link
                      key={a.id}
                      href={`/siswa/classes/${a.classSubjectId}/assignments/${a.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/40"
                    >
                      <span className="grid gap-0.5">
                        <span className="font-medium">{a.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {a.classSubject.subject.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(a.dueDate)}
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nilai Terbaru</CardTitle>
                <CardDescription>
                  Hasil penilaian tugas yang sudah dikembalikan.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {grades.length === 0 ? (
                  <EmptyState
                    icon={ClipboardCheckIcon}
                    title="Belum ada nilai"
                    description="Nilai tugas yang sudah dikembalikan akan tampil di sini."
                    compact
                  />
                ) : (
                  grades.map((s) => (
                    <Link
                      key={s.id}
                      href={`/siswa/classes/${s.assignment.classSubjectId}/assignments/${s.assignmentId}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/40"
                    >
                      <span className="grid gap-0.5">
                        <span className="font-medium">{s.assignment.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.assignment.classSubject.subject.name}
                        </span>
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {formatScore(s.grade)}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

// Personal progress visuals, streamed under the summary tiles.
async function StudentCharts() {
  const { data, error } = await getStudentProgress();
  if (!data) return <ChartsError message={error} />;

  return (
    <div className="grid gap-4">
      <SemesterAverageChart data={data.semesters} />
      <GradesOverTimeChart data={data.timeline} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SubjectRadarChart data={data.subjects} />
        <WorkloadDonut data={data.workload} />
      </div>
    </div>
  );
}
