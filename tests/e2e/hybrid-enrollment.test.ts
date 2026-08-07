// Hybrid enrollment flow: admin mints a class code, student claims it, and the
// system prevents a second enrollment in the same academic year.
import { describe, test, expect, afterAll } from "bun:test";
import { createClass, enrollStudentByCode } from "@/lib/services/class.service";
import { makeHarness, prisma, expectRejects } from "../helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("hybrid-enrollment — code generation and claim", () => {
  test("admin creating a class mints a usable studentJoinCode", async () => {
    const ay = await h.year({ isActive: true });
    const cls = await createClass({ name: "XII IPA 1", academicYearId: ay.id });

    expect(cls.studentJoinCode).toBeTruthy();
    expect(cls.studentJoinCode).not.toBe(cls.homeroomJoinCode);
  });

  test("student claims the code and lands in CLASS_STUDENTS", async () => {
    const ay = await h.year({ isActive: true });
    const cls = await createClass({ name: "XII IPA 2", academicYearId: ay.id });
    const student = await h.student();

    const enrollment = await enrollStudentByCode(student.id, cls.studentJoinCode!);
    expect(enrollment.classId).toBe(cls.id);
    expect(enrollment.studentId).toBe(student.id);

    const row = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: cls.id, studentId: student.id } },
    });
    expect(row).not.toBeNull();
  });
});

describe("hybrid-enrollment — duplicate prevention", () => {
  test("re-claiming the same class is rejected", async () => {
    const ay = await h.year({ isActive: true });
    const cls = await createClass({ name: "Dup A", academicYearId: ay.id });
    const student = await h.student();

    await enrollStudentByCode(student.id, cls.studentJoinCode!);
    await expectRejects(
      enrollStudentByCode(student.id, cls.studentJoinCode!),
      /sudah terdaftar/,
    );
  });

  test("a second class in the SAME academic year is rejected (one class per year)", async () => {
    const ay = await h.year({ isActive: true });
    const a = await createClass({ name: "Year A", academicYearId: ay.id });
    const b = await createClass({ name: "Year B", academicYearId: ay.id });
    const student = await h.student();

    await enrollStudentByCode(student.id, a.studentJoinCode!);
    await expectRejects(
      enrollStudentByCode(student.id, b.studentJoinCode!),
      /sudah terdaftar/,
    );

    const count = await prisma.classStudent.count({ where: { studentId: student.id } });
    expect(count).toBe(1);
  });

  test("an invalid code is rejected", async () => {
    const student = await h.student();
    await expectRejects(
      enrollStudentByCode(student.id, "KODE-TIDAK-ADA"),
      /Kode kelas tidak valid/,
    );
  });
});
