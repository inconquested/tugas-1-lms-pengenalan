// Assignment -> submission -> grading flow across teacher and student.
import { describe, test, expect, afterAll } from "bun:test";
import {
  createAssignment,
  getAssignmentById,
} from "@/lib/services/assignment.service";
import {
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment,
} from "@/lib/services/submission.service";
import { makeHarness } from "../helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("assignment-grading-flow", () => {
  test("teacher creates, student submits, teacher grades with feedback", async () => {
    const { cs, student } = await h.context();

    // Teacher posts an assignment for the class-subject.
    const assignment = await createAssignment({
      classSubjectId: cs.id,
      title: "Laporan Praktikum",
      description: "Kumpulkan laporan dalam PDF.",
      externalReferences: ["https://contoh.test/panduan"],
    });
    expect(assignment.slug).toBeTruthy();

    // Student submits their work.
    const submission = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "https://drive.test/laporan.pdf",
    });
    expect(submission.grade).toBeNull();

    // Teacher sees the submission with the student hydrated.
    const submissions = await getSubmissionsByAssignment(assignment.id);
    expect(submissions).toHaveLength(1);
    expect(submissions[0].student.id).toBe(student.id);

    // Teacher grades it with inline feedback.
    const graded = await gradeSubmission(submissions[0].id, 88, "Kerja bagus, rapikan grafik.");
    expect(graded.grade).toBe(88);
    expect(graded.feedback).toBe("Kerja bagus, rapikan grafik.");

    const after = await getAssignmentById(assignment.id);
    expect(after?.submissions[0].grade).toBe(88);
  });

  test("re-submitting overwrites the file instead of duplicating", async () => {
    const { cs, student } = await h.context();
    const assignment = await createAssignment({
      classSubjectId: cs.id,
      title: "Tugas Revisi",
      externalReferences: [],
    });

    await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/v1.pdf",
    });
    const second = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/v2.pdf",
    });

    expect(second.filePath).toBe("/v2.pdf");
    const all = await getSubmissionsByAssignment(assignment.id);
    expect(all).toHaveLength(1);
  });

  test("grade must stay within 0..100 at the schema boundary", async () => {
    // Enforced by GradeSubmissionSchema at the action layer; here we assert the
    // service persists the accepted boundary values.
    const { cs, student } = await h.context();
    const assignment = await createAssignment({
      classSubjectId: cs.id,
      title: "Nilai Batas",
      externalReferences: [],
    });
    const sub = await submitAssignment({
      assignmentId: assignment.id,
      studentId: student.id,
      filePath: "/x.pdf",
    });

    expect((await gradeSubmission(sub.id, 0)).grade).toBe(0);
    expect((await gradeSubmission(sub.id, 100)).grade).toBe(100);
  });
});
