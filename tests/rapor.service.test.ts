import { describe, test, expect, afterAll } from "bun:test";
import {
  upsertRaporComponent,
  calculateFinalGrade,
  updateRaporFinalNotes,
  toggleRaporLockStatus,
} from "@/lib/services/rapor.service";
import { makeHarness, prisma, expectRejects } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("rapor.service — components & final grade", () => {
  test("upsertRaporComponent inserts, then updates scores on the same (classSubject, student)", async () => {
    const { cs, student } = await h.context();
    const first = await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 80,
      skillScore: 70,
    });
    expect(first.knowledgeScore).toBe(80);

    const second = await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 90,
      skillScore: 60,
    });
    expect(second.id).toBe(first.id); // upsert, not a new row
    expect(second.knowledgeScore).toBe(90);

    const count = await prisma.raporComponent.count({
      where: { classSubjectId: cs.id, studentId: student.id },
    });
    expect(count).toBe(1);
  });

  test("calculateFinalGrade averages knowledge & skill 50/50", async () => {
    const { cs, student } = await h.context();
    await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 90,
      skillScore: 80,
    });
    const graded = await calculateFinalGrade(student.id, cs.id);
    expect(graded.finalScore).toBe(85); // (90 + 80) / 2
  });

  test("edge: null scores are treated as 0 in the average", async () => {
    const { cs, student } = await h.context();
    // Only knowledge provided; skill stays null -> (70 + 0) / 2.
    await upsertRaporComponent({ classSubjectId: cs.id, studentId: student.id, knowledgeScore: 70 });
    expect((await calculateFinalGrade(student.id, cs.id)).finalScore).toBe(35);

    // Both null -> 0.
    const ctx2 = await h.context();
    await upsertRaporComponent({ classSubjectId: ctx2.cs.id, studentId: ctx2.student.id });
    expect((await calculateFinalGrade(ctx2.student.id, ctx2.cs.id)).finalScore).toBe(0);
  });

  test("edge: calculateFinalGrade before any component rejects", async () => {
    const { cs, student } = await h.context();
    await expectRejects(calculateFinalGrade(student.id, cs.id), /Komponen rapor belum ada/);
  });

  test("edge: re-upserting after finalScore is computed preserves finalScore", async () => {
    const { cs, student } = await h.context();
    await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 100,
      skillScore: 100,
    });
    await calculateFinalGrade(student.id, cs.id); // finalScore = 100

    // The update path only writes knowledge/skill — finalScore must survive untouched.
    const after = await upsertRaporComponent({
      classSubjectId: cs.id,
      studentId: student.id,
      knowledgeScore: 50,
      skillScore: 50,
    });
    expect(after.finalScore).toBe(100); // stale until recalculated — documents current behaviour
  });
});

describe("rapor.service — final notes & lock", () => {
  test("updateRaporFinalNotes inserts then updates the (student, year) row", async () => {
    const { ay, student } = await h.context();
    const first = await updateRaporFinalNotes({
      studentId: student.id,
      academicYearId: ay.id,
      attendanceSick: 2,
      attendancePermission: 1,
      attendanceAlpha: 0,
      behaviorNote: "Baik",
    });
    expect(first.attendanceSick).toBe(2);
    expect(first.isLocked).toBeFalse();

    const second = await updateRaporFinalNotes({
      studentId: student.id,
      academicYearId: ay.id,
      attendanceSick: 5,
      behaviorNote: "Sangat baik",
    });
    expect(second.id).toBe(first.id); // upsert on @@unique([studentId, academicYearId])
    expect(second.attendanceSick).toBe(5);
    expect(second.behaviorNote).toBe("Sangat baik");
  });

  test("edge: attendance defaults to 0 when omitted on insert", async () => {
    const { ay, student } = await h.context();
    const r = await updateRaporFinalNotes({ studentId: student.id, academicYearId: ay.id });
    expect(r.attendanceSick).toBe(0);
    expect(r.attendancePermission).toBe(0);
    expect(r.attendanceAlpha).toBe(0);
    expect(r.behaviorNote).toBeNull();
  });

  test("toggleRaporLockStatus flips the lock both ways", async () => {
    const { ay, student } = await h.context();
    const r = await updateRaporFinalNotes({ studentId: student.id, academicYearId: ay.id });

    expect((await toggleRaporLockStatus(r.id, true)).isLocked).toBeTrue();
    expect((await toggleRaporLockStatus(r.id, false)).isLocked).toBeFalse();
  });

  test("edge: toggling a non-existent rapor final rejects (P2025)", async () => {
    let code: string | undefined;
    try {
      await toggleRaporLockStatus("00000000-0000-7000-8000-000000000000", true);
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2025");
  });
});
