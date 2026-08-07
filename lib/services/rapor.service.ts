import { prisma } from "@/lib/prisma";
import type {
  UpsertRaporComponentInput,
  UpdateRaporFinalInput,
} from "@/lib/types";

export const RAPOR_LOCKED_MESSAGE = "Rapor sudah dikunci dan tidak dapat diubah";

// True once Admin has locked this student's rapor for the given academic year.
async function isRaporLocked(studentId: string, academicYearId: string): Promise<boolean> {
  const rf = await prisma.raporFinal.findUnique({
    where: { studentId_academicYearId: { studentId, academicYearId } },
    select: { isLocked: true },
  });
  return rf?.isLocked ?? false;
}

// A component lives on a class-subject; its lock lives on the class's academic year.
async function academicYearOfClassSubject(classSubjectId: string): Promise<string> {
  const cs = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    select: { class: { select: { academicYearId: true } } },
  });
  if (!cs) throw new Error("Mata pelajaran kelas tidak ditemukan");
  return cs.class.academicYearId;
}

// One component row per (classSubject, student). Blocked once the rapor is locked.
export async function upsertRaporComponent(data: UpsertRaporComponentInput) {
  const academicYearId = await academicYearOfClassSubject(data.classSubjectId);
  if (await isRaporLocked(data.studentId, academicYearId)) {
    throw new Error(RAPOR_LOCKED_MESSAGE);
  }
  return prisma.raporComponent.upsert({
    where: {
      classSubjectId_studentId: {
        classSubjectId: data.classSubjectId,
        studentId: data.studentId,
      },
    },
    create: data,
    update: {
      knowledgeScore: data.knowledgeScore,
      skillScore: data.skillScore,
    },
  });
}

// ponytail: 50/50 knowledge/skill average. Tune weights here if kurikulum changes.
export async function calculateFinalGrade(
  studentId: string,
  classSubjectId: string,
) {
  const c = await prisma.raporComponent.findUnique({
    where: { classSubjectId_studentId: { classSubjectId, studentId } },
  });
  if (!c) throw new Error("Komponen rapor belum ada");

  const finalScore = ((c.knowledgeScore ?? 0) + (c.skillScore ?? 0)) / 2;
  return prisma.raporComponent.update({
    where: { id: c.id },
    data: { finalScore },
  });
}

// One final row per (student, academic year). Upsert so wali kelas can edit repeatedly,
// but only until Admin locks it.
export async function updateRaporFinalNotes(data: UpdateRaporFinalInput) {
  if (await isRaporLocked(data.studentId, data.academicYearId)) {
    throw new Error(RAPOR_LOCKED_MESSAGE);
  }
  return prisma.raporFinal.upsert({
    where: {
      studentId_academicYearId: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
      },
    },
    create: data,
    update: {
      attendanceSick: data.attendanceSick,
      attendancePermission: data.attendancePermission,
      attendanceAlpha: data.attendanceAlpha,
      behaviorNote: data.behaviorNote,
    },
  });
}

export function toggleRaporLockStatus(raporFinalId: string, isLocked: boolean) {
  return prisma.raporFinal.update({
    where: { id: raporFinalId },
    data: { isLocked },
  });
}
