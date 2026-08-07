import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { AssignmentGrid } from "@/components/app/assignment-grid";
import type { AssignmentCardData } from "@/components/app/assignment-card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tugas" };

export default async function GuruAssignmentsPage({
  params,
}: {
  params: Promise<{ classSubjectId: string }>;
}) {
  const { classSubjectId } = await params;
  const user = await requireRole("GURU");
  const base = `/guru/classes/${classSubjectId}/assignments`;

  const cs = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: {
      subject: true,
      class: { select: { _count: { select: { students: true } } } },
    },
  });
  if (!cs || cs.teacherId !== user.id) notFound();

  const studentCount = cs.class._count.students;
  const assignments = await prisma.assignment.findMany({
    where: { classSubjectId },
    include: { _count: { select: { submissions: true } } },
    orderBy: { dueDate: "asc" },
  });

  // Serialize once on the server so the client grid gets a stable clock and plain
  // values (dueDate as ISO) for sorting, filtering, and the edit form.
  const nowMs = new Date().getTime();
  const toCard = (a: (typeof assignments)[number]): AssignmentCardData => ({
    id: a.id,
    title: a.title,
    description: a.description,
    additionalNote: a.additionalNote,
    dueDate: a.dueDate ? a.dueDate.toISOString() : null,
    externalReferences: a.externalReferences,
    submissionCount: a._count.submissions,
    studentCount,
    href: `${base}/${a.id}`,
  });

  const active = assignments
    .filter((a) => !a.dueDate || a.dueDate.getTime() >= nowMs)
    .map(toCard);
  const archived = assignments
    .filter((a) => a.dueDate && a.dueDate.getTime() < nowMs)
    .map(toCard);

  return (
    <>
      <PageHeader
        title="Tugas"
        description={`Kelola tugas untuk ${cs.subject.name}.`}
      >
        <LinkButton href={`${base}/create`}>
          <PlusIcon aria-hidden="true" />
          Buat Tugas
        </LinkButton>
      </PageHeader>

      {assignments.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title="Belum ada tugas"
          description="Buat tugas pertama untuk kelas ini."
          action={
            <LinkButton href={`${base}/create`}>
              <PlusIcon aria-hidden="true" />
              Buat Tugas
            </LinkButton>
          }
        />
      ) : (
        <AssignmentGrid
          active={active}
          archived={archived}
          classSubjectId={classSubjectId}
          nowMs={nowMs}
        />
      )}
    </>
  );
}
