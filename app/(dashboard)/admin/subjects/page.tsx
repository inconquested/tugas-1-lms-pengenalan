import type { Metadata } from "next";
import {
  BookOpenIcon,
  GraduationCapIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react";
import { getSubjectsWithStats } from "@/lib/services/subject.service";
import { initials } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreateSubjectButton,
  SubjectRowActions,
} from "@/components/app/forms/subject-actions";

export const metadata: Metadata = { title: "Mata Pelajaran" };

const METRICS = [
  { key: "classCount", label: "Kelas", icon: LayersIcon },
  { key: "teacherCount", label: "Guru", icon: UsersIcon },
  { key: "studentCount", label: "Siswa", icon: GraduationCapIcon },
] as const;

export default async function AdminSubjectsPage() {
  const subjects = await getSubjectsWithStats();

  return (
    <>
      <PageHeader
        title="Mata Pelajaran"
        description="Data induk mata pelajaran yang dipakai di seluruh kelas."
      >
        <CreateSubjectButton />
      </PageHeader>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="Belum ada mata pelajaran"
          description="Tambahkan mata pelajaran pertama untuk mulai menyusun kelas."
          action={<CreateSubjectButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <CardHeader>
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-[family-name:var(--font-serif)] text-sm font-semibold text-primary ring-1 ring-primary/15"
                    aria-hidden="true"
                  >
                    {initials(subject.name)}
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{subject.name}</CardTitle>
                    <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {subject.code}
                    </code>
                  </div>
                </div>
                <CardAction>
                  <SubjectRowActions subject={subject} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-3 gap-2">
                  {METRICS.map((m) => (
                    <div
                      key={m.key}
                      className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-2.5 py-2"
                    >
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <m.icon className="size-3.5" aria-hidden="true" />
                        {m.label}
                      </dt>
                      <dd className="text-lg font-semibold tabular-nums">
                        {subject[m.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
