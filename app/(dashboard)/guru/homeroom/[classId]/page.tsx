import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KeyRoundIcon, UsersIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClassById } from "@/lib/services/class.service";
import { getClerkAvatarMap } from "@/lib/clerk-avatars";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { JoinCode } from "@/components/app/join-code";
import { EmptyState } from "@/components/app/empty-state";
import { RaporFinalRowForm } from "@/components/app/forms/rapor-final-row-form";
import { UserAvatar } from "@/components/app/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Wali Kelas" };

export default async function HomeroomPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await requireRole("GURU");

  const cls = await getClassById(classId);
  if (!cls || cls.homeroomTeacherId !== user.id) notFound();

  const academicYearId = cls.academicYearId;
  const studentIds = cls.students.map((cst) => cst.studentId);

  const finals = await prisma.raporFinal.findMany({
    where: { academicYearId, studentId: { in: studentIds } },
  });
  const byStudent = new Map(finals.map((f) => [f.studentId, f]));

  const students = cls.students
    .map((cst) => cst.student)
    .sort((a, b) => a.name.localeCompare(b.name));
  const avatars = await getClerkAvatarMap(students.map((s) => s.clerkId));

  return (
    <>
      <PageHeader
        title={cls.name}
        description={`Wali Kelas - ${cls.academicYear.year} ${semesterLabel(
          cls.academicYear.semester,
        )}`}
      />

      {cls.homeroomJoinCode || cls.studentJoinCode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cls.studentJoinCode ? (
            <JoinCode
              label="Kode gabung siswa"
              code={cls.studentJoinCode}
              icon={UsersIcon}
            />
          ) : null}
          {cls.homeroomJoinCode ? (
            <JoinCode
              label="Kode wali kelas"
              code={cls.homeroomJoinCode}
              icon={KeyRoundIcon}
            />
          ) : null}
        </div>
      ) : null}

      {students.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Belum ada siswa"
          description="Data wali kelas dapat diisi setelah ada siswa yang terdaftar."
        />
      ) : (
        <div className="grid gap-3">
          {students.map((student) => {
            const final = byStudent.get(student.id);
            return (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserAvatar
                      name={student.name}
                      src={avatars.get(student.clerkId)}
                    />
                    {student.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RaporFinalRowForm
                    classId={classId}
                    studentId={student.id}
                    academicYearId={academicYearId}
                    attendanceSick={final?.attendanceSick}
                    attendancePermission={final?.attendancePermission}
                    attendanceAlpha={final?.attendanceAlpha}
                    behaviorNote={final?.behaviorNote}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
