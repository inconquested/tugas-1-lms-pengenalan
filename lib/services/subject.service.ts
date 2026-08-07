import { prisma } from "@/lib/prisma";
import type { CreateSubjectInput, UpdateSubjectInput } from "@/lib/types";

export function createSubject(data: CreateSubjectInput) {
  return prisma.subject.create({ data });
}

export function getSubjects() {
  return prisma.subject.findMany({ orderBy: { name: "asc" } });
}

export type SubjectWithStats = {
  id: string;
  name: string;
  code: string;
  classCount: number;
  teacherCount: number;
  studentCount: number;
};

/**
 * Subjects enriched with usage metrics for the admin card grid. Derived purely
 * from existing relations (no schema change): a subject's reach is the classes
 * it is taught in, the distinct teachers assigned, and the students enrolled in
 * those classes.
 */
export async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      classSubjects: {
        select: {
          teacherId: true,
          class: { select: { _count: { select: { students: true } } } },
        },
      },
    },
  });

  return subjects.map((s) => {
    const teacherIds = new Set(
      s.classSubjects
        .map((cs) => cs.teacherId)
        .filter((id): id is string => Boolean(id)),
    );
    const studentCount = s.classSubjects.reduce(
      (sum, cs) => sum + cs.class._count.students,
      0,
    );
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      classCount: s.classSubjects.length,
      teacherCount: teacherIds.size,
      studentCount,
    };
  });
}

export function getSubjectById(id: string) {
  return prisma.subject.findUnique({ where: { id } });
}

export function updateSubject(id: string, data: UpdateSubjectInput) {
  return prisma.subject.update({ where: { id }, data });
}

export function deleteSubject(id: string) {
  return prisma.subject.delete({ where: { id } });
}
