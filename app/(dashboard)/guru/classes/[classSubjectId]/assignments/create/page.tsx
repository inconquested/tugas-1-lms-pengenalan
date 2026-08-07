import type { Metadata } from "next";
import { ArrowLeftIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/app/page-header";
import { AssignmentForm } from "@/components/app/forms/assignment-form";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Buat Tugas" };

export default async function CreateAssignmentPage({
  params,
}: {
  params: Promise<{ classSubjectId: string }>;
}) {
  const { classSubjectId } = await params;
  await requireRole("GURU");

  return (
    <>
      <PageHeader
        title="Buat Tugas"
        description="Susun tugas baru untuk siswa di kelas ini."
      >
        <LinkButton
          variant="outline"
          href={`/guru/classes/${classSubjectId}/assignments`}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Kembali
        </LinkButton>
      </PageHeader>

      <Card>
        <CardContent>
          <AssignmentForm classSubjectId={classSubjectId} />
        </CardContent>
      </Card>
    </>
  );
}
