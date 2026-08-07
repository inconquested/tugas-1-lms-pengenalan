import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SubmissionPreviewModal } from "@/components/app/forms/submission-preview-modal";

// Intercepts navigation to ../s/[submissionId] and renders it as a modal over the
// grading list (soft navigation). A refresh/hard load hits the sibling full page.
export default async function InterceptedSubmissionPreview({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  await requireRole("GURU");
  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true },
  });
  if (!submission) notFound();

  return (
    <SubmissionPreviewModal
      studentName={submission.student.name}
      filePath={submission.filePath}
      submittedAt={submission.submittedAt}
      grade={submission.grade}
      feedback={submission.feedback}
    />
  );
}
