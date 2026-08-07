import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatScore, semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { GradeBadge } from "@/components/app/grade-badge";
import { EmptyState } from "@/components/app/empty-state";
import { TableFrame } from "@/components/app/data-table";
import { PrintButton } from "@/components/app/print-button";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "E-Rapor" };

export default async function SiswaRaporDetailPage({
  params,
}: {
  params: Promise<{ academicYearId: string }>;
}) {
  const user = await requireRole("SISWA");
  const { academicYearId } = await params;

  const year = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
  });
  if (!year) notFound();

  const [components, final] = await Promise.all([
    prisma.raporComponent.findMany({
      where: {
        studentId: user.id,
        classSubject: { class: { academicYearId } },
      },
      include: { classSubject: { include: { subject: true } } },
    }),
    prisma.raporFinal.findUnique({
      where: {
        studentId_academicYearId: { studentId: user.id, academicYearId },
      },
    }),
  ]);

  // Semester average: the mean of scored subjects, the headline figure of the rapor.
  const scored = components
    .map((c) => c.finalScore)
    .filter((s): s is number => s != null);
  const semesterAverage =
    scored.length > 0
      ? Math.round((scored.reduce((sum, s) => sum + s, 0) / scored.length) * 10) / 10
      : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <PageHeader
          icon={FileTextIcon}
          title="E-Rapor"
          description={`Tahun Ajaran ${year.year} - Semester ${semesterLabel(
            year.semester,
          )}`}
        />
        <div className="flex items-center gap-2">
          <LinkButton href="/siswa/rapor" variant="outline">
            <ArrowLeftIcon aria-hidden="true" />
            Kembali
          </LinkButton>
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-card p-6 md:p-8 print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <header className="grid gap-1 border-b border-border pb-4 text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold tracking-tight">
            RAPOR
          </h2>
          <p className="text-sm text-muted-foreground">
            Laporan Hasil Belajar Siswa
          </p>
        </header>

        <dl className="grid gap-2 py-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Nama</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Tahun Ajaran</dt>
            <dd className="font-medium">{year.year}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Semester</dt>
            <dd className="font-medium">{semesterLabel(year.semester)}</dd>
          </div>
        </dl>

        {components.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            title="Rapor belum siap"
            description="Belum ada komponen penilaian untuk tahun ajaran ini. Rapor akan tampil setelah guru mengisi nilai."
          />
        ) : (
          <div className="grid gap-6">
            <TableFrame caption="Nilai mata pelajaran per tahun ajaran">
              <thead>
                <tr>
                  <th scope="col">Mata Pelajaran</th>
                  <th scope="col">Pengetahuan</th>
                  <th scope="col">Keterampilan</th>
                  <th scope="col">Nilai Akhir</th>
                  <th scope="col">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="font-medium">
                      {c.classSubject.subject.name}
                    </th>
                    <td className="tabular-nums">
                      {formatScore(c.knowledgeScore)}
                    </td>
                    <td className="tabular-nums">
                      {formatScore(c.skillScore)}
                    </td>
                    <td className="tabular-nums">
                      {formatScore(c.finalScore)}
                    </td>
                    <td>
                      <GradeBadge score={c.finalScore} mode="band" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="[&_td]:px-3 [&_td]:py-2.5">
                <tr className="border-t-2 border-border bg-muted/40">
                  <th scope="row" className="font-semibold">
                    Rata-rata Semester
                  </th>
                  <td aria-hidden="true" />
                  <td aria-hidden="true" />
                  <td className="tabular-nums font-semibold">
                    {formatScore(semesterAverage)}
                  </td>
                  <td>
                    <GradeBadge score={semesterAverage} mode="band" />
                  </td>
                </tr>
              </tfoot>
            </TableFrame>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">Ketidakhadiran</h3>
                <dl className="grid gap-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sakit</dt>
                    <dd className="tabular-nums">
                      {final?.attendanceSick ?? 0} hari
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Izin</dt>
                    <dd className="tabular-nums">
                      {final?.attendancePermission ?? 0} hari
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Alpha</dt>
                    <dd className="tabular-nums">
                      {final?.attendanceAlpha ?? 0} hari
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-2 rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">Catatan Perilaku</h3>
                <p className="text-sm text-muted-foreground">
                  {final?.behaviorNote ?? "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
