import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenIcon, UsersIcon } from "lucide-react";
import { getClassById } from "@/lib/services/class.service";
import { getSubjects } from "@/lib/services/subject.service";
import { getUsersByRole } from "@/lib/services/user.service";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { TableFrame } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { CopyButton } from "@/components/app/copy-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddClassSubjectButton } from "@/components/app/forms/add-class-subject-button";

export const metadata: Metadata = { title: "Detail Kelas" };

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const cls = await getClassById(classId);
  if (!cls) notFound();

  const [subjects, teachers] = await Promise.all([
    getSubjects(),
    getUsersByRole("GURU"),
  ]);
  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }));
  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.name }));

  return (
    <>
      <PageHeader
        title={cls.name}
        description={`Tahun ajaran ${cls.academicYear.year} - Semester ${semesterLabel(cls.academicYear.semester)}`}
      >
        <AddClassSubjectButton
          classId={cls.id}
          subjects={subjectOptions}
          teachers={teacherOptions}
        />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Kode wali kelas</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <code className="font-mono text-sm">
              {cls.homeroomJoinCode ?? "-"}
            </code>
            {cls.homeroomJoinCode ? (
              <CopyButton
                value={cls.homeroomJoinCode}
                label="Salin kode wali kelas"
              />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Kode siswa</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <code className="font-mono text-sm">
              {cls.studentJoinCode ?? "-"}
            </code>
            {cls.studentJoinCode ? (
              <CopyButton value={cls.studentJoinCode} label="Salin kode siswa" />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Siswa Terdaftar
        </h2>
        {cls.students.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Belum ada siswa"
            description="Siswa bergabung menggunakan kode siswa di atas."
          />
        ) : (
          <TableFrame caption="Daftar siswa terdaftar">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.map((cs) => (
                <tr key={cs.id}>
                  <th scope="row" className="font-medium">
                    {cs.student.name}
                  </th>
                  <td>{cs.student.email}</td>
                </tr>
              ))}
            </tbody>
          </TableFrame>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Guru Mata Pelajaran
        </h2>
        {cls.classSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpenIcon}
            title="Belum ada mata pelajaran"
            description="Tambahkan mata pelajaran lewat tombol Tambah mapel."
          />
        ) : (
          <TableFrame caption="Daftar mata pelajaran dan gurunya">
            <thead>
              <tr>
                <th scope="col">Mata Pelajaran</th>
                <th scope="col">Jam</th>
                <th scope="col">Guru</th>
                <th scope="col">Kode Guru</th>
              </tr>
            </thead>
            <tbody>
              {cls.classSubjects.map((cs) => (
                <tr key={cs.id}>
                  <th scope="row" className="font-medium">
                    {cs.subject.name}
                  </th>
                  <td className="whitespace-nowrap tabular-nums">
                    {cs.TimeStart}–{cs.TimeEnd}
                  </td>
                  <td>
                    {cs.teacher ? (
                      cs.teacher.name
                    ) : (
                      <Badge variant="secondary">Belum diklaim</Badge>
                    )}
                  </td>
                  <td>
                    {cs.teacherJoinCode ? (
                      <span className="inline-flex items-center gap-1.5">
                        <code className="font-mono text-xs">
                          {cs.teacherJoinCode}
                        </code>
                        <CopyButton
                          value={cs.teacherJoinCode}
                          label={`Salin kode guru ${cs.subject.name}`}
                        />
                      </span>
                    ) : (
                      "-"
                    )}
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
