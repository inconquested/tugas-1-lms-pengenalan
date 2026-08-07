import type { Metadata } from "next";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getStudentSemesterAverages } from "@/lib/services/analytics.service";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { GradeBadge } from "@/components/app/grade-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Rapor" };

export default async function SiswaRaporPage() {
  const user = await requireRole("SISWA");

  const enrollments = await prisma.classStudent.findMany({
    where: { studentId: user.id },
    include: { class: { include: { academicYear: true } } },
  });

  // Dedupe enrolled academic years by id.
  const years = Array.from(
    new Map(
      enrollments.map((e) => [e.class.academicYear.id, e.class.academicYear]),
    ).values(),
  );

  const [finals, semesters] = await Promise.all([
    prisma.raporFinal.findMany({
      where: {
        studentId: user.id,
        academicYearId: { in: years.map((y) => y.id) },
      },
    }),
    getStudentSemesterAverages(user.id),
  ]);
  const lockedYearIds = new Set(
    finals.filter((f) => f.isLocked).map((f) => f.academicYearId),
  );
  // Per-year rapor average, so each term shows its headline figure without opening it.
  const averageByYear = new Map(semesters.terms.map((t) => [t.yearId, t.average]));

  return (
    <>
      <PageHeader
        title="Rapor"
        description="Laporan hasil belajar untuk setiap tahun ajaran yang kamu ikuti."
      />

      {years.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title="Belum ada rapor"
          description="Rapor akan tersedia setelah kamu bergabung ke kelas dan penilaian dimulai."
        />
      ) : (
        <div className="grid gap-3">
          {years.map((year) => (
            <Link
              key={year.id}
              href={`/siswa/rapor/${year.id}`}
              className="group"
            >
              <Card className="transition-colors group-hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="grid gap-0.5">
                    <span className="font-medium">
                      Tahun Ajaran {year.year}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Semester {semesterLabel(year.semester)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {averageByYear.has(year.id) ? (
                      <GradeBadge score={averageByYear.get(year.id)} mode="score" />
                    ) : null}
                    {lockedYearIds.has(year.id) ? <Badge>Final</Badge> : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
