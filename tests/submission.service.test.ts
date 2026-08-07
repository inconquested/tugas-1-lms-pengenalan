import { describe, test, expect, afterAll } from "bun:test";
import {
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment,
} from "@/lib/services/submission.service";
import { createAssignment } from "@/lib/services/assignment.service";
import { enrollStudentByCode } from "@/lib/services/class.service";
import { makeHarness, prisma } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

async function assignmentFixture() {
  const ctx = await h.context();
  const assignment = await createAssignment({
    classSubjectId: ctx.cs.id,
    title: `Tugas ${h.uid()}`,
    externalReferences: [],
  });
  return { ...ctx, assignment };
}

describe("submission.service", () => {
  test("submitAssignment creates a submission (upsert insert path)", async () => {
    const { assignment, student } = await assignmentFixture();
    const sub = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/uploads/first.pdf",
    });
    expect(sub.filePath).toBe("/uploads/first.pdf");
    expect(sub.grade).toBeNull();
    expect(sub.submittedAt).toBeInstanceOf(Date);
  });

  test("edge: re-submitting overwrites filePath but keeps one row & original submittedAt", async () => {
    const { assignment, student } = await assignmentFixture();
    const first = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/uploads/v1.pdf",
    });
    const second = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/uploads/v2.pdf",
    });

    expect(second.id).toBe(first.id); // upsert on @@unique([assignmentId, studentId])
    expect(second.filePath).toBe("/uploads/v2.pdf");
    expect(second.submittedAt.getTime()).toBe(first.submittedAt.getTime()); // update leaves submittedAt alone

    const count = await prisma.submission.count({ where: { assignmentId: assignment.id } });
    expect(count).toBe(1);
  });

  test("gradeSubmission stores grade + feedback, incl. boundary & fractional values", async () => {
    const { assignment, student } = await assignmentFixture();
    const sub = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/x.pdf",
    });

    const graded = await gradeSubmission(sub.id, 87.5, "Bagus, tingkatkan lagi");
    expect(graded.grade).toBe(87.5); // Float column keeps the decimal
    expect(graded.feedback).toBe("Bagus, tingkatkan lagi");

    // Boundary grades 0 and 100 both persist.
    expect((await gradeSubmission(sub.id, 0)).grade).toBe(0);
    const perfect = await gradeSubmission(sub.id, 100);
    expect(perfect.grade).toBe(100);
    // Feedback omitted -> Prisma reads the `undefined` as "leave column untouched", so the
    // note from the first grading survives the re-grade. The service can't clear feedback:
    // its `feedback?: string` signature can't pass null. Re-grading only overwrites grade.
    expect(perfect.feedback).toBe("Bagus, tingkatkan lagi");
  });

  test("getSubmissionsByAssignment returns each student's row with student hydrated", async () => {
    const { assignment, student } = await assignmentFixture();
    await submitAssignment({ assignmentId: assignment.id, studentId: student.id, filePath: "/a.pdf" });

    const subs = await getSubmissionsByAssignment(assignment.id);
    expect(subs.length).toBe(1);
    expect(subs[0].student.id).toBe(student.id); // relation hydrated by the include
    expect(subs[0].student.email).toBeString();
  });

  test("edge: grading a non-existent submission rejects (P2025)", async () => {
    let code: string | undefined;
    try {
      await gradeSubmission("00000000-0000-7000-8000-000000000000", 90);
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2025");
  });

  test("edge: two different students submit the same assignment -> two rows", async () => {
    const { assignment, cls } = await assignmentFixture();
    const s1 = await h.student();
    const s2 = await h.student();
    await enrollStudentByCode(s1.id, cls.studentJoinCode!);
    await enrollStudentByCode(s2.id, cls.studentJoinCode!);

    await submitAssignment({ assignmentId: assignment.id, studentId: s1.id, filePath: "/s1.pdf" });
    await submitAssignment({ assignmentId: assignment.id, studentId: s2.id, filePath: "/s2.pdf" });

    const subs = await getSubmissionsByAssignment(assignment.id);
    const ids = subs.map((s) => s.studentId);
    expect(ids).toContain(s1.id);
    expect(ids).toContain(s2.id);
  });
});
