import { prisma } from "@/lib/prisma";
import type { CreateSubmissionInput } from "@/lib/types";

// One submission per (assignment, student); re-submitting overwrites the file.
export function submitAssignment(data: CreateSubmissionInput) {
  return prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    },
    create: data,
    update: { filePath: data.filePath },
  });
}

export function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback?: string,
) {
  return prisma.submission.update({
    where: { id: submissionId },
    data: { grade, feedback },
  });
}

export function getSubmissionsByAssignment(assignmentId: string) {
  return prisma.submission.findMany({
    where: { assignmentId },
    include: { student: true },
  });
}
