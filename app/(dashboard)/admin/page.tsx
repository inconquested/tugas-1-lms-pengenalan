import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  GraduationCapIcon,
  SchoolIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveAcademicYear } from "@/lib/services/academic-year.service";
import { getClassesByAcademicYear } from "@/lib/services/class.service";
import { getAdminDashboardStats } from "@/lib/actions/analytics";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { SystemScaleChart } from "@/components/app/charts/system-scale-chart";
import { UserGrowthChart } from "@/components/app/charts/user-growth-chart";
import { SystemLoadPanel } from "@/components/app/charts/system-load-panel";
import { LeaderboardPanel } from "@/components/app/charts/leaderboard-panel";
import { ChartsError } from "@/components/app/charts/charts-error";
import { AdminChartsSkeleton } from "@/components/app/charts/charts-skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dasbor Admin" };

export default async function AdminDashboardPage() {
  const activeYear = await getActiveAcademicYear();
  const [totalUsers, totalTeachers, totalStudents, totalSubjects] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "GURU" } }),
      prisma.user.count({ where: { role: "SISWA" } }),
      prisma.subject.count(),
    ]);
  const classes = activeYear
    ? await getClassesByAcademicYear(activeYear.id)
    : [];

  return (
    <>
      <PageHeader
        title="Dasbor Admin"
        description="Ringkasan data sekolah dan pintasan pengelolaan LMS."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Pengguna" value={totalUsers} icon={UsersIcon} />
        <StatCard label="Guru" value={totalTeachers} icon={GraduationCapIcon} />
        <StatCard label="Siswa" value={totalStudents} icon={UserRoundIcon} />
        <StatCard
          label="Kelas (tahun aktif)"
          value={classes.length}
          icon={SchoolIcon}
          hint={activeYear ? undefined : "Belum ada tahun ajaran aktif."}
        />
        <StatCard
          label="Mata Pelajaran"
          value={totalSubjects}
          icon={BookOpenIcon}
        />
        <StatCard
          label="Tahun Ajaran Aktif"
          value={activeYear ? activeYear.year : "Belum diatur"}
          icon={CalendarRangeIcon}
          hint={
            activeYear
              ? `Semester ${semesterLabel(activeYear.semester)}`
              : undefined
          }
        />
      </div>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Analitik &amp; Wawasan
        </h2>
        <Suspense fallback={<AdminChartsSkeleton />}>
          <AdminCharts activeYearId={activeYear?.id} />
        </Suspense>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Tahun ajaran berjalan</CardDescription>
            <CardTitle className="text-xl">
              {activeYear
                ? `${activeYear.year} - Semester ${semesterLabel(activeYear.semester)}`
                : "Belum ada tahun ajaran aktif"}
            </CardTitle>
            {activeYear ? (
              <CardAction>
                <Badge>Aktif</Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {activeYear
              ? "Seluruh kelas dan rapor mengikuti tahun ajaran ini."
              : "Tetapkan tahun ajaran aktif agar kelas dan rapor dapat berjalan."}
          </CardContent>
          {activeYear ? null : (
            <CardFooter>
              <LinkButton
                href="/admin/academic-years"
                variant="outline"
                size="sm"
              >
                Atur tahun ajaran
              </LinkButton>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Status sistem</CardDescription>
            <CardTitle className="text-xl">Operasional</CardTitle>
            <CardAction className="text-muted-foreground">
              <CheckCircle2Icon className="size-5" aria-hidden="true" />
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Semua layanan berjalan normal.
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/admin/users" variant="outline">
          Kelola Pengguna
          <ArrowRightIcon aria-hidden="true" />
        </LinkButton>
        <LinkButton href="/admin/classes" variant="outline">
          Kelola Kelas
          <ArrowRightIcon aria-hidden="true" />
        </LinkButton>
        <LinkButton href="/admin/rapor" variant="outline">
          E-Rapor
          <ArrowRightIcon aria-hidden="true" />
        </LinkButton>
      </div>
    </>
  );
}

// Streamed separately so the heavier aggregations never block the summary tiles above.
async function AdminCharts({ activeYearId }: { activeYearId?: string }) {
  const { data, error } = await getAdminDashboardStats(activeYearId);
  if (!data) return <ChartsError message={error} />;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <SystemScaleChart data={data.scale} />
        <div className="lg:col-span-2">
          <UserGrowthChart series={data.growth} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SystemLoadPanel metrics={data.load} />
        <div className="lg:col-span-2">
          <LeaderboardPanel data={data.leaderboards} />
        </div>
      </div>
    </div>
  );
}
