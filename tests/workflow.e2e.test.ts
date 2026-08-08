// The real end-to-end journey: a full semester modelled top to bottom, touching every
// service the way the app would in sequence. If the services compose, this passes.
import { describe, test, expect, afterAll } from "bun:test";
import { upsertUserFromClerk } from "@/lib/services/user.service";
import {
  createAcademicYear,
  setActiveAcademicYear,
  getActiveAcademicYear,
} from "@/lib/services/academic-year.service";
import { createSubject } from "@/lib/services/subject.service";
import {
  createClass,
  createClassSubject,
  enrollStudentByCode,
  claimHomeroomByCode,
  claimSubjectByCode,
  getClassById,
} from "@/lib/services/class.service";
import { createAssignment, getAssignmentById } from "@/lib/services/assignment.service";
import { submitAssignment, gradeSubmission, getSubmissionsByAssignment } from "@/lib/services/submission.service";
import {
  upsertRaporComponent,
  calculateFinalGrade,
  updateRaporFinalNotes,
  toggleRaporLockStatus,
} from "@/lib/services/rapor.service";
import { makeHarness, prisma } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("end-to-end semester workflow", () => {
  // Explicit timeout: this journey makes dozens of round-trips to the remote pooler, well
  // past bun's 5s default. (The package.json script also sets --timeout globally.)
  test("admin → teacher → students → assignment → grades → rapor → lock", async () => {
    const tag = h.uid();

    // 1. Admin provisions people (via the Clerk-sync upsert) and the academic term.
    const admin = h.trackUser(
      await upsertUserFromClerk({ clerkId: `admin-${tag}`, email: `admin-${tag}@e2e.test`, name: "Admin", role: "ADMIN" }),
    );
    const waliKelas = h.trackUser(
      await upsertUserFromClerk({ clerkId: `wali-${tag}`, email: `wali-${tag}@e2e.test`, name: "Wali", role: "GURU" }),
    );
    const guruMapel = h.trackUser(
      await upsertUserFromClerk({ clerkId: `guru-${tag}`, email: `guru-${tag}@e2e.test`, name: "Guru", role: "GURU" }),
    );
    expect(admin.role).toBe("ADMIN");

    const ay = h.trackYear(await createAcademicYear({ year: "2099/2100", semester: "GANJIL" }));
    await setActiveAcademicYear(ay.id);
    expect((await getActiveAcademicYear())?.id).toBe(ay.id);

    // 2. Admin sets up a subject, a class, and the class-subject slot.
    const subject = h.trackSubject(await createSubject({ name: "Fisika", code: `FIS-${tag}` }));
    const cls = await createClass({ name: "XII IPA 1", academicYearId: ay.id });
    const cs = await createClassSubject({ classId: cls.id, subjectId: subject.id, TimeStart: "07:00", TimeEnd: "08:30" });

    // 3. Teachers claim their roles by code.
    const claimedHomeroom = await claimHomeroomByCode(waliKelas.id, cls.homeroomJoinCode!);
    expect(claimedHomeroom.homeroomTeacherId).toBe(waliKelas.id);
    const claimedSubject = await claimSubjectByCode(guruMapel.id, cs.teacherJoinCode!);
    expect(claimedSubject.teacherId).toBe(guruMapel.id);

    // 4. Three students enrol via the class code.
    const students = await Promise.all(
      ["Ani", "Budi", "Citra"].map((name, i) =>
        upsertUserFromClerk({
          clerkId: `siswa-${tag}-${i}`,
          email: `siswa-${tag}-${i}@e2e.test`,
          name,
          role: "SISWA",
        }).then((u) => h.trackUser(u)),
      ),
    );
    for (const s of students) await enrollStudentByCode(s.id, cls.studentJoinCode!);

    // Class snapshot reflects the full roster and staffing.
    const snapshot = await getClassById(cls.id);
    expect(snapshot?.homeroomTeacher?.id).toBe(waliKelas.id);
    expect(snapshot?.students.length).toBe(3);
    expect(snapshot?.classSubjects[0].teacher?.id).toBe(guruMapel.id);

    // 5. Subject teacher posts an assignment.
    const assignment = await createAssignment({
      classSubjectId: cs.id,
      title: "Laporan Praktikum Gaya",
      description: "Ukur percepatan gravitasi",
      dueDate: new Date("2099-10-01T23:59:00Z"),
      externalReferences: ["https://example.com/panduan"],
    });

    // 6. Every student submits.
    for (const [i, s] of students.entries()) {
      await submitAssignment({ assignmentId: assignment.id, studentId: s.id, filePath: `/uploads/${tag}-${i}.pdf` });
    }
    const submissions = await getSubmissionsByAssignment(assignment.id);
    expect(submissions.length).toBe(3);

    // 7. Teacher grades each submission.
    const grades = [95, 82, 74];
    for (const [i, sub] of submissions.entries()) {
      await gradeSubmission(sub.id, grades[i], "Lihat catatan");
    }
    const graded = await getAssignmentById(assignment.id);
    expect(graded?.submissions.every((s) => typeof s.grade === "number")).toBeTrue();

    // 8. Teacher records rapor components and computes final scores per student.
    for (const s of students) {
      await upsertRaporComponent({
        classSubjectId: cs.id,
        studentId: s.id,
        knowledgeScore: 88,
        skillScore: 92,
      });
      const finalComp = await calculateFinalGrade(s.id, cs.id);
      expect(finalComp.finalScore).toBe(90); // (88 + 92) / 2
    }

    // 9. Wali kelas fills attendance/behaviour, then locks the rapor.
    for (const s of students) {
      const rapor = await updateRaporFinalNotes({
        studentId: s.id,
        academicYearId: ay.id,
        attendanceSick: 1,
        attendancePermission: 0,
        attendanceAlpha: 0,
        behaviorNote: "Berkembang baik",
      });
      const locked = await toggleRaporLockStatus(rapor.id, true);
      expect(locked.isLocked).toBeTrue();
    }

    // Final integrity sweep across the graph.
    expect(await prisma.classStudent.count({ where: { classId: cls.id } })).toBe(3);
    expect(await prisma.raporComponent.count({ where: { classSubjectId: cs.id } })).toBe(3);
    expect(await prisma.raporFinal.count({ where: { academicYearId: ay.id, isLocked: true } })).toBe(3);
  }, 60000);

  test("deleting the academic year cascades the whole tree away", async () => {
    // Build a small graph rooted at a throwaway year, then delete the year and assert
    // classes, class-subjects, assignments, submissions and rapor rows all vanish.
    const ay = await createAcademicYear({ year: "2088/2089", semester: "GENAP" });
    const subject = h.trackSubject(await createSubject({ name: "Kimia", code: `KIM-${h.uid()}` }));
    const cls = await createClass({ name: "Cascade Class", academicYearId: ay.id });
    const cs = await createClassSubject({ classId: cls.id, subjectId: subject.id, TimeStart: "07:00", TimeEnd: "08:30" });
    const student = await h.student();
    await enrollStudentByCode(student.id, cls.studentJoinCode!);
    const assignment = await createAssignment({ classSubjectId: cs.id, title: "Doomed", externalReferences: [] });
    const sub = await submitAssignment({ assignmentId: assignment.id, studentId: student.id, filePath: "/x.pdf" });
    await upsertRaporComponent({ classSubjectId: cs.id, studentId: student.id, knowledgeScore: 50 });
    await updateRaporFinalNotes({ studentId: student.id, academicYearId: ay.id });

    await prisma.academicYear.delete({ where: { id: ay.id } });

    expect(await prisma.class.findUnique({ where: { id: cls.id } })).toBeNull();
    expect(await prisma.classSubject.findUnique({ where: { id: cs.id } })).toBeNull();
    expect(await prisma.assignment.findUnique({ where: { id: assignment.id } })).toBeNull();
    expect(await prisma.submission.findUnique({ where: { id: sub.id } })).toBeNull();
    expect(await prisma.raporComponent.count({ where: { classSubjectId: cs.id } })).toBe(0);
    expect(await prisma.raporFinal.count({ where: { academicYearId: ay.id } })).toBe(0);
    // The student user itself survives — only the enrolment cascade should have fired.
    expect(await prisma.user.findUnique({ where: { id: student.id } })).not.toBeNull();
  }, 60000);
});
