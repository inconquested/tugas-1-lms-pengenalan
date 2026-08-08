import { describe, test, expect, afterAll } from "bun:test";
import {
  createClass,
  getClassesByAcademicYear,
  getClassById,
  createClassSubject,
  enrollStudentByCode,
  claimHomeroomByCode,
  claimSubjectByCode,
} from "@/lib/services/class.service";
import { makeHarness, prisma, expectRejects } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("class.service — creation & reads", () => {
  test("createClass mints non-empty, unique student & homeroom join codes", async () => {
    const ay = await h.year();
    const a = await createClass({ name: "XII-A", academicYearId: ay.id });
    const b = await createClass({ name: "XII-B", academicYearId: ay.id });

    for (const c of [a, b]) {
      expect(c.studentJoinCode).toBeTruthy();
      expect(c.homeroomJoinCode).toBeTruthy();
    }
    // Codes are random per row — no collisions across classes or between the two code kinds.
    const codes = [a.studentJoinCode, a.homeroomJoinCode, b.studentJoinCode, b.homeroomJoinCode];
    expect(new Set(codes).size).toBe(4);
  });

  test("getClassesByAcademicYear returns only that year's classes, sorted by name asc", async () => {
    const ay = await h.year();
    const other = await h.year();
    await createClass({ name: "Zebra", academicYearId: ay.id });
    await createClass({ name: "Apple", academicYearId: ay.id });
    await createClass({ name: "Mango", academicYearId: other.id });

    const classes = await getClassesByAcademicYear(ay.id);
    expect(classes.map((c) => c.name)).toEqual(["Apple", "Zebra"]);
    // Relations are hydrated by the include.
    expect(classes[0].academicYear.id).toBe(ay.id);
    expect(classes[0]).toHaveProperty("classSubjects");
  });

  test("getClassById hydrates students + class-subjects; null for a missing id", async () => {
    const { cls, student } = await h.context();
    const full = await getClassById(cls.id);
    expect(full?.students.some((s) => s.student.id === student.id)).toBeTrue();
    expect(full?.classSubjects.length).toBeGreaterThan(0);
    expect(full?.classSubjects[0].subject).toBeDefined();

    expect(await getClassById("00000000-0000-7000-8000-000000000000")).toBeNull();
  });

  test("createClassSubject mints a teacher join code; duplicate (class,subject) rejects", async () => {
    const cls = await h.klass();
    const subj = await h.subject();
    const cs = await createClassSubject({ classId: cls.id, subjectId: subj.id, TimeStart: "07:00", TimeEnd: "08:30" });
    expect(cs.teacherJoinCode).toBeTruthy();
    expect(cs.teacherId).toBeNull();

    let code: string | undefined;
    try {
      await createClassSubject({ classId: cls.id, subjectId: subj.id, TimeStart: "07:00", TimeEnd: "08:30" });
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2002"); // @@unique([classId, subjectId])
  });
});

describe("class.service — enrollStudentByCode", () => {
  test("enrolls a student via a valid code", async () => {
    const cls = await h.klass();
    const stud = await h.student();
    const enr = await enrollStudentByCode(stud.id, cls.studentJoinCode!);
    expect(enr.classId).toBe(cls.id);
    expect(enr.studentId).toBe(stud.id);
  });

  test("edge: invalid code rejects with the Indonesian message", async () => {
    const stud = await h.student();
    await expectRejects(enrollStudentByCode(stud.id, "kode-ngawur"), /Kode kelas tidak valid/);
  });

  test("edge: re-enrolling in the SAME class rejects (already enrolled this year)", async () => {
    const cls = await h.klass();
    const stud = await h.student();
    await enrollStudentByCode(stud.id, cls.studentJoinCode!);
    await expectRejects(enrollStudentByCode(stud.id, cls.studentJoinCode!), /sudah terdaftar/);
  });

  test("edge: enrolling in a DIFFERENT class of the SAME year rejects", async () => {
    const ay = await h.year();
    const a = await createClass({ name: "One", academicYearId: ay.id });
    const b = await createClass({ name: "Two", academicYearId: ay.id });
    const stud = await h.student();

    await enrollStudentByCode(stud.id, a.studentJoinCode!);
    // The guard is per academic year, not per class — a second class in the same year is blocked.
    await expectRejects(enrollStudentByCode(stud.id, b.studentJoinCode!), /sudah terdaftar/);
  });

  test("edge: SAME student may enroll across DIFFERENT academic years", async () => {
    const y1 = await h.year();
    const y2 = await h.year();
    const c1 = await createClass({ name: "Y1", academicYearId: y1.id });
    const c2 = await createClass({ name: "Y2", academicYearId: y2.id });
    const stud = await h.student();

    await enrollStudentByCode(stud.id, c1.studentJoinCode!);
    const second = await enrollStudentByCode(stud.id, c2.studentJoinCode!);
    expect(second.classId).toBe(c2.id);

    const count = await prisma.classStudent.count({ where: { studentId: stud.id } });
    expect(count).toBe(2);
  });

  test("edge: two concurrent enrolls (different classes, same year) — exactly one wins", async () => {
    // This is the whole point of the Serializable isolation level: the app-level "already
    // enrolled?" check + insert span different rows, so only Serializable stops a double-enroll.
    const ay = await h.year();
    const a = await createClass({ name: "Race-A", academicYearId: ay.id });
    const b = await createClass({ name: "Race-B", academicYearId: ay.id });
    const stud = await h.student();

    const results = await Promise.allSettled([
      enrollStudentByCode(stud.id, a.studentJoinCode!),
      enrollStudentByCode(stud.id, b.studentJoinCode!),
    ]);
    const ok = results.filter((r) => r.status === "fulfilled");

    expect(ok.length).toBe(1);
    const count = await prisma.classStudent.count({ where: { studentId: stud.id } });
    expect(count).toBe(1);
  });
});

describe("class.service — claim flows", () => {
  test("claimHomeroomByCode: valid claim, invalid code, and double-claim", async () => {
    const cls = await h.klass();
    const t1 = await h.teacher();
    const t2 = await h.teacher();

    const claimed = await claimHomeroomByCode(t1.id, cls.homeroomJoinCode!);
    expect(claimed.homeroomTeacherId).toBe(t1.id);

    await expectRejects(claimHomeroomByCode(t2.id, "kode-ngawur"), /Kode wali kelas tidak valid/);
    await expectRejects(claimHomeroomByCode(t2.id, cls.homeroomJoinCode!), /sudah diklaim/);
  });

  test("claimSubjectByCode: valid claim, invalid code, and double-claim", async () => {
    const cls = await h.klass();
    const subj = await h.subject();
    const cs = await createClassSubject({ classId: cls.id, subjectId: subj.id, TimeStart: "07:00", TimeEnd: "08:30" });
    const t1 = await h.teacher();
    const t2 = await h.teacher();

    const claimed = await claimSubjectByCode(t1.id, cs.teacherJoinCode!);
    expect(claimed.teacherId).toBe(t1.id);

    await expectRejects(claimSubjectByCode(t2.id, "kode-ngawur"), /Kode mapel tidak valid/);
    await expectRejects(claimSubjectByCode(t2.id, cs.teacherJoinCode!), /sudah diklaim/);
  });

  test("edge: two teachers race to claim one homeroom — exactly one wins", async () => {
    const cls = await h.klass();
    const t1 = await h.teacher();
    const t2 = await h.teacher();

    const results = await Promise.allSettled([
      claimHomeroomByCode(t1.id, cls.homeroomJoinCode!),
      claimHomeroomByCode(t2.id, cls.homeroomJoinCode!),
    ]);
    expect(results.filter((r) => r.status === "fulfilled").length).toBe(1);

    const fresh = await prisma.class.findUnique({ where: { id: cls.id } });
    expect([t1.id, t2.id]).toContain(fresh!.homeroomTeacherId!); // one claim won, so it's set
  });
});
