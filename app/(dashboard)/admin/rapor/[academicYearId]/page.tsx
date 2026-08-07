import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  FileTextIcon,
  LockIcon,
  LockOpenIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { TableFrame } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { ActionButton } from "@/components/app/action-button";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { toggleRaporLockAction } from "@/lib/actions/rapor";

export const metadata: Metadata = { title: "Kunci E-Rapor" };

export default async function AdminRaporYearPage({
  params,
}: {
  params: Promise<{ academicYearId: string }>;
}) {
  const { academicYearId } = await params;
  const year = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
  });
  if (!year) notFound();

  const rapors = await prisma.raporFinal.findMany({
    where: { academicYearId },
    include: { student: true },
    orderBy: { student: { name: "asc" } },
  });

  const lockedCount = rapors.filter((rf) => rf.isLocked).length;
  const openCount = rapors.length - lockedCount;

  return (
    <>
      <PageHeader
        icon={FileTextIcon}
        title="Kunci E-Rapor"
        description={`Tahun ajaran ${year.year} - Semester ${semesterLabel(year.semester)}`}
      >
        <LinkButton href="/admin/rapor" variant="outline">
          <ArrowLeftIcon aria-hidden="true" />
          Semua tahun ajaran
        </LinkButton>
      </PageHeader>

      <p className="max-w-prose text-sm text-muted-foreground">
        Mengunci rapor mencegah guru mengubah nilai maupun catatan siswa terkait.
      </p>

      {rapors.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title="Belum ada rapor"
          description="Rapor muncul setelah guru mengisi nilai dan wali kelas melengkapi datanya."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Rapor"
              value={rapors.length}
              icon={FileTextIcon}
            />
            <StatCard label="Terkunci" value={lockedCount} icon={LockIcon} />
            <StatCard label="Terbuka" value={openCount} icon={LockOpenIcon} />
          </div>

          <TableFrame caption="Daftar rapor akhir siswa">
            <thead>
              <tr>
                <th scope="col">Siswa</th>
                <th scope="col">Ketidakhadiran</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rapors.map((rf) => (
                <tr key={rf.id}>
                  <th scope="row" className="font-medium">
                    {rf.student.name}
                  </th>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5 tabular-nums">
                      <Badge variant="warning" title="Sakit">
                        S {rf.attendanceSick}
                      </Badge>
                      <Badge variant="info" title="Izin">
                        I {rf.attendancePermission}
                      </Badge>
                      <Badge variant="destructive" title="Alpa">
                        A {rf.attendanceAlpha}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    {rf.isLocked ? (
                      <Badge variant="destructive">
                        <LockIcon aria-hidden="true" />
                        Terkunci
                      </Badge>
                    ) : (
                      <Badge variant="success">
                        <LockOpenIcon aria-hidden="true" />
                        Terbuka
                      </Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <ActionButton
                      action={toggleRaporLockAction.bind(
                        null,
                        rf.id,
                        !rf.isLocked,
                        academicYearId,
                      )}
                    >
                      {rf.isLocked ? "Buka" : "Kunci"}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        </>
      )}
    </>
  );
}
