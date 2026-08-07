// Rapor: component input -> final calculation -> wali-kelas notes -> admin lock,
// then assert the lock blocks any further teacher modification.
import { describe, test, expect, afterAll } from "bun:test";
import {
  upsertRaporComponent,
  calculateFinalGrade,
  updateRaporFinalNotes,
  toggleRaporLockStatus,
} from "@/lib/services/rapor.service";
import { makeHarness, prisma, expectRejects } from "../helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("rapor-calculation-lock", () => {
  test("teacher populates components and the final score is the 50/50 average", async () => {
    const { cs, student } = await h.context();
    await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 88,
      skillScore: 92,
    });
    const final = await calculateFinalGrade(student.id, cs.id);
    expect(final.finalScore).toBe(90);
  });

  test("wali kelas records attendance + behaviour, then admin locks the rapor", async () => {
    const { ay, cs, student } = await h.context();
    await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 80,
      skillScore: 80,
    });
    await calculateFinalGrade(student.id, cs.id);

    const rapor = await updateRaporFinalNotes({
      studentId: student.id,
      academicYearId: ay.id,
      attendanceSick: 2,
      attendancePermission: 1,
      attendanceAlpha: 0,
      behaviorNote: "Perlu lebih aktif berdiskusi.",
    });
    expect(rapor.isLocked).toBeFalse();

    const locked = await toggleRaporLockStatus(rapor.id, true);
    expect(locked.isLocked).toBeTrue();
  });

  test("after locking, teacher modifications are rejected", async () => {
    const { ay, cs, student } = await h.context();
    await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 70,
      skillScore: 70,
    });
    const rapor = await updateRaporFinalNotes({
      studentId: student.id,
      academicYearId: ay.id,
      attendanceSick: 0,
    });
    await toggleRaporLockStatus(rapor.id, true);

    // Wali kelas can no longer edit the final row.
    await expectRejects(
      updateRaporFinalNotes({
        studentId: student.id,
        academicYearId: ay.id,
        behaviorNote: "Coba ubah setelah dikunci.",
      }),
      /dikunci/,
    );

    // Subject teacher can no longer change component scores either.
    await expectRejects(
      upsertRaporComponent({
        classSubjectId: cs.id,
        studentId: student.id,
        knowledgeScore: 100,
        skillScore: 100,
      }),
      /dikunci/,
    );

    // The stored scores are untouched by the rejected writes.
    const comp = await prisma.raporComponent.findUnique({
      where: {
        classSubjectId_studentId: { classSubjectId: cs.id, studentId: student.id },
      },
    });
    expect(comp?.knowledgeScore).toBe(70);
  });

  test("admin can unlock, allowing edits again", async () => {
    const { ay, cs, student } = await h.context();
    await upsertRaporComponent({ classSubjectId: cs.id, studentId: student.id, knowledgeScore: 60 });
    const rapor = await updateRaporFinalNotes({ studentId: student.id, academicYearId: ay.id });

    await toggleRaporLockStatus(rapor.id, true);
    await toggleRaporLockStatus(rapor.id, false);

    const reopened = await updateRaporFinalNotes({
      studentId: student.id,
      academicYearId: ay.id,
      behaviorNote: "Boleh diedit lagi.",
    });
    expect(reopened.behaviorNote).toBe("Boleh diedit lagi.");
  });
});
