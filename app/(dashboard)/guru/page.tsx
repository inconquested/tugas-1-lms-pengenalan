import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  BookOpenIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  PlusIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeacherAnalytics } from "@/lib/actions/analytics";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { GradeDistributionChart } from "@/components/app/charts/grade-distribution-chart";
import { CompletionDonut } from "@/components/app/charts/completion-donut";
import { ClassEngagementGrid } from "@/components/app/charts/class-engagement-grid";
import { ChartsError } from "@/components/app/charts/charts-error";
import { TeacherChartsSkeleton } from "@/components/app/charts/charts-skeleton";
import { LinkButton } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Beranda Guru" };

export default async function GuruHomePage() {
  const user = await requireRole("GURU");

  const [
    classSubjectCount,
    homeroomCount,
    assignmentCount,
    ungradedCount,
    classSubjects,
  ] = await Promise.all([
    prisma.classSubject.count({ where: { teacherId: user.id } }),
    prisma.class.count({ where: { homeroomTeacherId: user.id } }),
    prisma.assignment.count({ where: { classSubject: { teacherId: user.id } } }),
    prisma.submission.count({
      where: {
        grade: null,
        assignment: { classSubject: { teacherId: user.id } },
      },
    }),
    prisma.classSubject.findMany({
      where: { teacherId: user.id },
      include: { subject: true, class: { include: { academicYear: true } } },
      orderBy: { subject: { name: "asc" } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={`Halo, ${user.name}`}
        description="Ringkasan kelas dan tugas yang Anda bina."
      >
        <LinkButton href="/guru/classes/join">
          <PlusIcon aria-hidden="true" />
          Gabung Kelas
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kelas Dibina" value={classSubjectCount} icon={BookOpenIcon} />
        <StatCard label="Wali Kelas" value={homeroomCount} icon={GraduationCapIcon} />
        <StatCard label="Total Tugas" value={assignmentCount} icon={ClipboardListIcon} />
        <StatCard
          label="Perlu Dinilai"
          value={ungradedCount}
          icon={ClipboardCheckIcon}
        />
      </div>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Analitik Kelas
        </h2>
        <Suspense fallback={<TeacherChartsSkeleton />}>
          <TeacherCharts />
        </Suspense>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Kelas &amp; Mapel Binaan
        </h2>
        {classSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpenIcon}
            title="Belum ada kelas binaan"
            description="Gabung ke mata pelajaran atau klaim wali kelas menggunakan kode dari admin."
            action={
              <LinkButton href="/guru/classes/join">
                <PlusIcon aria-hidden="true" />
                Gabung Kelas
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classSubjects.map((cs) => (
              <Link
                key={cs.id}
                href={`/guru/classes/${cs.id}`}
                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardDescription>
                      {cs.class.name}, {cs.class.academicYear.year}{" "}
                      {semesterLabel(cs.class.academicYear.semester)}
                    </CardDescription>
                    <CardTitle>{cs.subject.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// Classroom analytics, streamed under the summary tiles.
async function TeacherCharts() {
  const { data, error } = await getTeacherAnalytics();
  if (!data) return <ChartsError message={error} />;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <GradeDistributionChart data={data.distribution} />
        <CompletionDonut data={data.completion} />
      </div>
      <ClassEngagementGrid data={data.engagement} />
    </div>
  );
}
