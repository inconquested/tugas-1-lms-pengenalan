// Shared E2E test harness.
//
// These tests run against the REAL Postgres (the DATABASE_URL in .env) — there is no
// mock layer. Each service function is exercised end-to-end through Prisma so the tests
// catch schema drift, constraint violations, cascade behaviour, and transaction logic
// that a mocked unit test never would.
//
// Isolation strategy: every harness instance gets a unique RUN token and a numeric year
// base, so parallel/leftover data never collides. Everything created hangs off one of
// three cascade roots — User, AcademicYear, Subject — so cleanup() only has to delete
// those; onDelete: Cascade fans the delete out to every child row.
import { expect } from "bun:test";
import { prisma } from "@/lib/prisma";
import {
  createClass,
  createClassSubject,
  enrollStudentByCode,
} from "@/lib/services/class.service";
import type { Role, Semester } from "@/app/generated/prisma/client";

export { prisma };

// Assert a promise rejects with a message matching `match`.
//
// Why not `expect(promise).rejects.toThrow(...)`? bun:test's `.rejects` matcher
// breaks Prisma 7 *interactive* transactions: the awaited transaction stalls and
// fails with "Unable to start a transaction in the given time" instead of running.
// The identical call awaited directly in try/catch works every time (verified:
// .rejects → 21s stall, try/catch → 372ms). So we await it ourselves. This keeps
// rejection assertions reliable for both plain and $transaction-backed services.
export async function expectRejects(promise: Promise<unknown>, match: RegExp | string) {
  let message: string | undefined;
  try {
    await promise;
  } catch (err) {
    message = err instanceof Error ? err.message : String(err);
  }
  if (message === undefined) {
    throw new Error(`Expected promise to reject with ${match}, but it resolved`);
  }
  if (typeof match === "string") expect(message).toContain(match);
  else expect(message).toMatch(match);
}

type UserOverrides = Partial<{ clerkId: string; email: string; name: string; role: Role }>;
type YearOverrides = Partial<{ year: string; semester: Semester; isActive: boolean }>;
type SubjectOverrides = Partial<{ name: string; code: string }>;

export function makeHarness() {
  const RUN = crypto.randomUUID().slice(0, 8);
  // Year strings must match /^\d{4}\/\d{4}$/. Random 4-digit base keeps runs from clashing
  // on the (year, semester) unique constraint even if a prior run failed to clean up.
  const yearBase = 1000 + Math.floor(Math.random() * 7000);
  let seq = 0;
  let yearSeq = 0;
  const uid = () => `${RUN}-${(seq++).toString(36)}`;

  const created = {
    users: new Set<string>(),
    years: new Set<string>(),
    subjects: new Set<string>(),
  };

  const trackUser = <T extends { id: string }>(u: T) => (created.users.add(u.id), u);
  const trackYear = <T extends { id: string }>(y: T) => (created.years.add(y.id), y);
  const trackSubject = <T extends { id: string }>(s: T) => (created.subjects.add(s.id), s);

  async function user(overrides: UserOverrides = {}) {
    const tag = uid();
    return trackUser(
      await prisma.user.create({
        data: {
          clerkId: overrides.clerkId ?? `clerk-${tag}`,
          email: overrides.email ?? `${tag}@e2e.test`,
          name: overrides.name ?? `User ${tag}`,
          role: overrides.role ?? "SISWA",
        },
      }),
    );
  }

  const student = (o: UserOverrides = {}) => user({ ...o, role: "SISWA" });
  const teacher = (o: UserOverrides = {}) => user({ ...o, role: "GURU" });
  const admin = (o: UserOverrides = {}) => user({ ...o, role: "ADMIN" });

  async function year(overrides: YearOverrides = {}) {
    const n = yearBase + yearSeq++;
    return trackYear(
      await prisma.academicYear.create({
        data: {
          year: overrides.year ?? `${n}/${n + 1}`,
          semester: overrides.semester ?? "GANJIL",
          isActive: overrides.isActive ?? false,
        },
      }),
    );
  }

  async function subject(overrides: SubjectOverrides = {}) {
    const tag = uid();
    return trackSubject(
      await prisma.subject.create({
        data: {
          name: overrides.name ?? `Subject ${tag}`,
          code: overrides.code ?? `SUBJ-${tag}`,
        },
      }),
    );
  }

  async function klass(
    opts: { academicYearId?: string; homeroomTeacherId?: string; name?: string } = {},
  ) {
    const academicYearId = opts.academicYearId ?? (await year()).id;
    return createClass({
      name: opts.name ?? `Kelas ${uid()}`,
      academicYearId,
      homeroomTeacherId: opts.homeroomTeacherId,
    });
  }

  async function classSubject(
    opts: { classId?: string; subjectId?: string; teacherId?: string } = {},
  ) {
    const classId = opts.classId ?? (await klass()).id;
    const subjectId = opts.subjectId ?? (await subject()).id;
    return createClassSubject({
      classId,
      subjectId,
      teacherId: opts.teacherId,
      TimeStart: "07:00",
      TimeEnd: "08:30",
    });
  }

  // Full graph: active year + subject + class + teacher-claimed class-subject + one
  // enrolled student. Convenient fixture for assignment/submission/rapor tests.
  async function context() {
    const ay = await year({ isActive: true });
    const subj = await subject();
    const cls = await klass({ academicYearId: ay.id });
    const teach = await teacher();
    const cs = await classSubject({ classId: cls.id, subjectId: subj.id, teacherId: teach.id });
    const stud = await student();
    const enrollment = await enrollStudentByCode(stud.id, cls.studentJoinCode!);
    return { ay, subj, cls, teacher: teach, cs, student: stud, enrollment };
  }

  async function cleanup() {
    // Delete order is irrelevant thanks to cascades, but we swallow errors so one failed
    // delete never masks a real test failure in the report.
    await prisma.academicYear
      .deleteMany({ where: { id: { in: [...created.years] } } })
      .catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [...created.users] } } }).catch(() => {});
    await prisma.subject
      .deleteMany({ where: { id: { in: [...created.subjects] } } })
      .catch(() => {});
    created.users.clear();
    created.years.clear();
    created.subjects.clear();
  }

  return {
    uid,
    prisma,
    created,
    trackUser,
    trackYear,
    trackSubject,
    user,
    student,
    teacher,
    admin,
    year,
    subject,
    klass,
    classSubject,
    context,
    cleanup,
  };
}

export type Harness = ReturnType<typeof makeHarness>;
