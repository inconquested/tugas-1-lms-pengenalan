import { prisma } from "@/lib/prisma";
import type {
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
} from "@/lib/types";

export function createAcademicYear(data: CreateAcademicYearInput) {
  return prisma.academicYear.create({ data });
}

export function getAcademicYears() {
  return prisma.academicYear.findMany({ orderBy: { year: "desc" } });
}

export function getActiveAcademicYear() {
  return prisma.academicYear.findFirst({ where: { isActive: true } });
}

export type AcademicYearWithStats = {
  id: string;
  year: string;
  semester: "GANJIL" | "GENAP";
  isActive: boolean;
  classCount: number;
  studentCount: number;
};

/** Each year with its reach (classes + enrolled students) for the status cards. */
export async function getAcademicYearsWithStats(): Promise<
  AcademicYearWithStats[]
> {
  const years = await prisma.academicYear.findMany({
    orderBy: { year: "desc" },
    include: {
      _count: { select: { classes: true } },
      classes: { select: { _count: { select: { students: true } } } },
    },
  });

  return years.map((y) => ({
    id: y.id,
    year: y.year,
    semester: y.semester,
    isActive: y.isActive,
    classCount: y._count.classes,
    studentCount: y.classes.reduce((sum, c) => sum + c._count.students, 0),
  }));
}

/** School-wide fast metric lookups for the admin overview strip. */
export async function getSchoolMetrics() {
  const [totalClasses, totalSubjects, activeStudents] = await Promise.all([
    prisma.class.count(),
    prisma.subject.count(),
    prisma.classStudent.count({
      where: { class: { academicYear: { isActive: true } } },
    }),
  ]);
  return { totalClasses, totalSubjects, activeStudents };
}

export function updateAcademicYear(id: string, data: UpdateAcademicYearInput) {
  return prisma.academicYear.update({ where: { id }, data });
}

export function deleteAcademicYear(id: string) {
  return prisma.academicYear.delete({ where: { id } });
}

// Exactly one active year at a time — flip all off, then this one on, atomically.
export function setActiveAcademicYear(id: string) {
  return prisma.$transaction([
    prisma.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    }),
    prisma.academicYear.update({ where: { id }, data: { isActive: true } }),
  ]);
}
