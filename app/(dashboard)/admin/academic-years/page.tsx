import type { Metadata } from "next";
import {
  CalendarRangeIcon,
  GraduationCapIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react";
import {
  getAcademicYearsWithStats,
  getSchoolMetrics,
} from "@/lib/services/academic-year.service";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AcademicYearRowActions,
  CreateAcademicYearButton,
} from "@/components/app/forms/academic-year-actions";

export const metadata: Metadata = { title: "Tahun Ajaran" };

export default async function AdminAcademicYearsPage() {
  const [years, metrics] = await Promise.all([
    getAcademicYearsWithStats(),
    getSchoolMetrics(),
  ]);

  return (
    <>
      <PageHeader
        title="Tahun Ajaran"
        description="Kelola periode tahun ajaran dan tentukan semester aktif."
      >
        <CreateAcademicYearButton />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Kelas"
          value={metrics.totalClasses}
          icon={LayersIcon}
        />
        <StatCard
          label="Siswa Aktif"
          value={metrics.activeStudents}
          icon={GraduationCapIcon}
          hint="Terdaftar di tahun ajaran aktif"
        />
        <StatCard
          label="Mata Pelajaran"
          value={metrics.totalSubjects}
          icon={CalendarRangeIcon}
        />
      </div>

      {years.length === 0 ? (
        <EmptyState
          icon={CalendarRangeIcon}
          title="Belum ada tahun ajaran"
          description="Tambahkan tahun ajaran pertama untuk mulai membuat kelas."
          action={<CreateAcademicYearButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {years.map((y) => (
            <Card
              key={y.id}
              className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  {y.isActive ? (
                    <span className="relative flex size-2.5" aria-hidden="true">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/70 motion-reduce:hidden" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
                    </span>
                  ) : null}
                  <Badge variant={y.isActive ? "success" : "outline"}>
                    {y.isActive ? "Aktif" : "Arsip"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{y.year}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {semesterLabel(y.semester)}
                </p>
                <CardAction>
                  <AcademicYearRowActions academicYear={y} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-2.5 py-2">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LayersIcon className="size-3.5" aria-hidden="true" />
                      Kelas
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">
                      {y.classCount}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-2.5 py-2">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UsersIcon className="size-3.5" aria-hidden="true" />
                      Siswa
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">
                      {y.studentCount}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
