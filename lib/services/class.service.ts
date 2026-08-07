import { prisma } from "@/lib/prisma";
import { genCode } from "@/lib/services/util";
import type {
  CreateClassInput,
  CreateClassSubjectInput,
} from "@/lib/types";

// The teacher/homeroom ids on the admin "plotting" forms arrive as raw uuids through a
// POST-callable Server Action, so the referenced user is re-checked server-side: a crafted
// request (or a stale dropdown) must not seat a SISWA or ADMIN as a wali kelas or subject
// teacher. A non-GURU there would silently strand the class — only GURU accounts can reach
// the /guru views that manage it.
async function assertGuru(userId: string, label: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) throw new Error(`${label} tidak ditemukan.`);
  if (user.role !== "GURU") throw new Error(`${label} harus seorang guru.`);
}

export async function createClass(data: CreateClassInput) {
  if (data.homeroomTeacherId) await assertGuru(data.homeroomTeacherId, "Wali kelas");
  return prisma.class.create({
    data: { ...data, studentJoinCode: genCode(), homeroomJoinCode: genCode() },
  });
}

// Backfill any missing class-level join codes and persist them immediately, so a class
// created before codes existed (or imported/seeded without them) still surfaces valid,
// copyable codes on its first fetch rather than showing a dash until manual intervention.
async function ensureClassCodes<
  T extends {
    id: string;
    studentJoinCode: string | null;
    homeroomJoinCode: string | null;
  },
>(cls: T): Promise<void> {
  const data: { studentJoinCode?: string; homeroomJoinCode?: string } = {};
  if (!cls.studentJoinCode) data.studentJoinCode = genCode();
  if (!cls.homeroomJoinCode) data.homeroomJoinCode = genCode();
  if (data.studentJoinCode === undefined && data.homeroomJoinCode === undefined) {
    return;
  }
  const updated = await prisma.class.update({ where: { id: cls.id }, data });
  cls.studentJoinCode = updated.studentJoinCode;
  cls.homeroomJoinCode = updated.homeroomJoinCode;
}

// Same fallback for a subject slot's teacher join code.
async function ensureSubjectCode<
  T extends { id: string; teacherJoinCode: string | null },
>(cs: T): Promise<void> {
  if (cs.teacherJoinCode) return;
  const updated = await prisma.classSubject.update({
    where: { id: cs.id },
    data: { teacherJoinCode: genCode() },
  });
  cs.teacherJoinCode = updated.teacherJoinCode;
}

export async function getClassesByAcademicYear(academicYearId: string) {
  const classes = await prisma.class.findMany({
    where: { academicYearId },
    include: {
      academicYear: true,
      homeroomTeacher: true,
      classSubjects: { include: { subject: true, teacher: true } },
      students: true, // enrolment rows, for the roster count on the classes list
    },
    orderBy: { name: "asc" },
  });
  await Promise.all(classes.map((c) => ensureClassCodes(c)));
  return classes;
}

export async function getClassById(id: string) {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      academicYear: true,
      homeroomTeacher: true,
      classSubjects: { include: { subject: true, teacher: true } },
      students: { include: { student: true } },
    },
  });
  if (!cls) return null;
  await Promise.all([
    ensureClassCodes(cls),
    ...cls.classSubjects.map((cs) => ensureSubjectCode(cs)),
  ]);
  return cls;
}

// Add a subject slot to a class; a teacher claims it later via the generated code, or the
// admin plots one now — validated the same way as a homeroom assignment.
export async function createClassSubject(data: CreateClassSubjectInput) {
  if (data.teacherId) await assertGuru(data.teacherId, "Guru pengampu");
  return prisma.classSubject.create({
    data: { ...data, teacherJoinCode: genCode() },
  });
}

// Student enrolls via a class code. Atomic: reject if already in ANY class of the same academic year.
export function enrollStudentByCode(studentId: string, studentJoinCode: string) {
  return prisma.$transaction(async (tx) => {
    const cls = await tx.class.findUnique({ where: { studentJoinCode } });
    if (!cls) throw new Error("Kode kelas tidak valid");

    const existing = await tx.classStudent.findFirst({
      where: { studentId, class: { academicYearId: cls.academicYearId } },
    });
    if (existing) throw new Error("Anda sudah terdaftar di kelas pada tahun ajaran ini");

    return tx.classStudent.create({ data: { classId: cls.id, studentId } });
  }, { isolationLevel: "Serializable" }); // check + insert span different rows; Serializable prevents double-enroll
}

// Teacher claims homeroom (wali kelas). Atomic: reject if already claimed.
export function claimHomeroomByCode(teacherId: string, homeroomJoinCode: string) {
  return prisma.$transaction(async (tx) => {
    const cls = await tx.class.findUnique({ where: { homeroomJoinCode } });
    if (!cls) throw new Error("Kode wali kelas tidak valid");
    if (cls.homeroomTeacherId) {
      throw new Error(
        cls.homeroomTeacherId === teacherId
          ? "Anda sudah menjadi wali kelas ini"
          : "Wali kelas sudah diklaim guru lain",
      );
    }

    return tx.class.update({
      where: { id: cls.id },
      data: { homeroomTeacherId: teacherId },
    });
  }, { isolationLevel: "Serializable" }); // prevent two teachers claiming the same homeroom
}

// Teacher claims a class-subject. Atomic: reject if already claimed.
export function claimSubjectByCode(teacherId: string, teacherJoinCode: string) {
  return prisma.$transaction(async (tx) => {
    const cs = await tx.classSubject.findUnique({ where: { teacherJoinCode } });
    if (!cs) throw new Error("Kode mapel tidak valid");
    if (cs.teacherId) {
      throw new Error(
        cs.teacherId === teacherId
          ? "Anda sudah mengampu mapel ini"
          : "Mapel sudah diklaim guru lain",
      );
    }

    return tx.classSubject.update({
      where: { id: cs.id },
      data: { teacherId },
    });
  }, { isolationLevel: "Serializable" }); // prevent two teachers claiming the same class-subject
}
