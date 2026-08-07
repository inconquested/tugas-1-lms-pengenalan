import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ClipboardListIcon,
  FileTextIcon,
  GraduationCapIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAssignmentsByClassSubject } from "@/lib/services/assignment.service";
import { formatDate, semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { JoinCode } from "@/components/app/join-code";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { TableFrame } from "@/components/app/data-table";
import { LinkButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Detail Mata Pelajaran" };

export default async function GuruClassSubjectPage({
  params,
}: {
  params: Promise<{ classSubjectId: string }>;
}) {
  const { classSubjectId } = await params;
  const user = await requireRole("GURU");

  const cs = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: {
      subject: true,
      class: { include: { academicYear: true, students: true } },
    },
  });
  if (!cs || cs.teacherId !== user.id) notFound();

  const assignments = await getAssignmentsByClassSubject(classSubjectId);
  const recent = assignments.slice(0, 5);

  return (
    <>
      <PageHeader
        title={cs.subject.name}
        description={`${cs.class.name}, ${cs.class.academicYear.year} ${semesterLabel(
          cs.class.academicYear.semester,
        )}`}
      />

      {cs.class.studentJoinCode || cs.teacherJoinCode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cs.class.studentJoinCode ? (
            <JoinCode
              label="Kode gabung siswa"
              code={cs.class.studentJoinCode}
              icon={UsersIcon}
            />
          ) : null}
          {cs.teacherJoinCode ? (
            <JoinCode
              label="Kode guru mapel"
              code={cs.teacherJoinCode}
              icon={TicketIcon}
            />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Jumlah Siswa"
          value={cs.class.students.length}
          icon={UsersIcon}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardListIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              Tugas
            </CardTitle>
            <CardDescription>Kelola tugas dan pengumpulan siswa.</CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton variant="outline" href={`/guru/classes/${classSubjectId}/assignments`}>
              Kelola Tugas
            </LinkButton>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCapIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              Rapor
            </CardTitle>
            <CardDescription>Isi nilai pengetahuan dan keterampilan.</CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton
              variant="outline"
              href={`/guru/classes/${classSubjectId}/rapor-components`}
            >
              Nilai Rapor
            </LinkButton>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
            Tugas Terbaru
          </h2>
          {assignments.length > 0 ? (
            <LinkButton variant="outline" size="sm" href={`/guru/classes/${classSubjectId}/assignments`}>
              Lihat semua
            </LinkButton>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            title="Belum ada tugas"
            description="Buat tugas pertama untuk kelas ini."
            action={
              <LinkButton
                href={`/guru/classes/${classSubjectId}/assignments/create`}
              >
                Buat Tugas
              </LinkButton>
            }
          />
        ) : (
          <TableFrame caption="Daftar tugas terbaru">
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Batas Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((assignment) => (
                <tr key={assignment.id}>
                  <th scope="row" className="font-medium">
                    <Link
                      href={`/guru/classes/${classSubjectId}/assignments/${assignment.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {assignment.title}
                    </Link>
                  </th>
                  <td className="text-muted-foreground">
                    {assignment.dueDate ? formatDate(assignment.dueDate) : "Tanpa batas"}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        )}
      </section>
    </>
  );
}
