import type { Metadata } from "next";
import { SchoolIcon } from "lucide-react";
import {
  getAcademicYears,
  getActiveAcademicYear,
} from "@/lib/services/academic-year.service";
import { getClassesByAcademicYear } from "@/lib/services/class.service";
import { getUsersByRole } from "@/lib/services/user.service";
import { getClerkAvatarMap } from "@/lib/clerk-avatars";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ClassCard, type ClassCardData } from "@/components/app/class-card";
import { LinkButton } from "@/components/ui/button";
import { CreateClassButton } from "@/components/app/forms/class-actions";

export const metadata: Metadata = { title: "Kelas" };

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const { ay } = await searchParams;
  const [years, activeYear, teachers] = await Promise.all([
    getAcademicYears(),
    getActiveAcademicYear(),
    getUsersByRole("GURU"),
  ]);

  const selectedYearId =
    (ay ? years.find((y) => y.id === ay)?.id : undefined) ??
    activeYear?.id ??
    years[0]?.id;

  const classes = selectedYearId
    ? await getClassesByAcademicYear(selectedYearId)
    : [];

  const avatars = await getClerkAvatarMap(
    classes.flatMap((c) => [
      c.homeroomTeacher?.clerkId,
      ...c.classSubjects.map((cs) => cs.teacher?.clerkId),
    ]),
  );

  const cards: ClassCardData[] = classes.map((c) => ({
    id: c.id,
    name: c.name,
    href: `/admin/classes/${c.id}`,
    studentJoinCode: c.studentJoinCode,
    studentCount: c.students.length,
    subjectCount: c.classSubjects.length,
    homeroom: c.homeroomTeacher
      ? {
          name: c.homeroomTeacher.name,
          email: c.homeroomTeacher.email,
          avatar: avatars.get(c.homeroomTeacher.clerkId),
        }
      : null,
    subjects: c.classSubjects.map((cs) => ({
      id: cs.id,
      subjectName: cs.subject.name,
      teacher: cs.teacher
        ? {
            name: cs.teacher.name,
            email: cs.teacher.email,
            avatar: avatars.get(cs.teacher.clerkId),
          }
        : null,
      teacherJoinCode: cs.teacherJoinCode,
    })),
  }));

  const yearOptions = years.map((y) => ({
    value: y.id,
    label: `${y.year} - ${semesterLabel(y.semester)}`,
  }));
  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.name }));

  return (
    <>
      <PageHeader
        title="Kelas"
        description="Kelola kelas dan wali kelas per tahun ajaran."
      >
        <CreateClassButton
          years={yearOptions}
          teachers={teacherOptions}
          defaultYearId={selectedYearId}
        />
      </PageHeader>

      {years.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <LinkButton
              key={y.id}
              href={`/admin/classes?ay=${y.id}`}
              variant={y.id === selectedYearId ? "default" : "outline"}
              size="sm"
            >
              {y.year} - {semesterLabel(y.semester)}
            </LinkButton>
          ))}
        </div>
      ) : null}

      {years.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="Belum ada tahun ajaran"
          description="Buat tahun ajaran terlebih dahulu sebelum menambah kelas."
        />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="Belum ada kelas"
          description="Tambahkan kelas untuk tahun ajaran ini."
          action={
            <CreateClassButton
              years={yearOptions}
              teachers={teacherOptions}
              defaultYearId={selectedYearId}
            />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ClassCard key={card.id} data={card} />
          ))}
        </div>
      )}
    </>
  );
}
