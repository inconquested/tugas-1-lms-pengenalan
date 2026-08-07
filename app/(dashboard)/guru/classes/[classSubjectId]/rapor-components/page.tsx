import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UsersIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { semesterLabel } from "@/lib/format";
import { getClerkAvatarMap } from "@/lib/clerk-avatars";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { RaporComponentRowForm } from "@/components/app/forms/rapor-component-row-form";
import { UserAvatar } from "@/components/app/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Nilai Rapor" };

export default async function RaporComponentsPage({
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
      class: {
        include: {
          academicYear: true,
          students: { include: { student: true } },
        },
      },
    },
  });
  if (!cs || cs.teacherId !== user.id) notFound();

  const components = await prisma.raporComponent.findMany({
    where: { classSubjectId },
    include: { student: true },
  });
  const byStudent = new Map(components.map((c) => [c.studentId, c]));

  const students = cs.class.students
    .map((cst) => cst.student)
    .sort((a, b) => a.name.localeCompare(b.name));
  const avatars = await getClerkAvatarMap(students.map((s) => s.clerkId));

  return (
    <>
      <PageHeader
        title="Nilai Rapor"
        description={`${cs.subject.name} - ${cs.class.name}, ${
          cs.class.academicYear.year
        } ${semesterLabel(cs.class.academicYear.semester)}`}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Belum ada siswa"
          description="Nilai dapat diisi setelah ada siswa yang terdaftar di kelas ini."
        />
      ) : (
        <div className="grid gap-3">
          {students.map((student) => {
            const component = byStudent.get(student.id);
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
                  <RaporComponentRowForm
                    classSubjectId={classSubjectId}
                    studentId={student.id}
                    knowledgeScore={component?.knowledgeScore}
                    skillScore={component?.skillScore}
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
