import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon, GraduationCapIcon, PlusIcon, UsersIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { LinkButton } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Kelas Saya" };

export default async function GuruClassesPage() {
  const user = await requireRole("GURU");

  const [classSubjects, homerooms] = await Promise.all([
    prisma.classSubject.findMany({
      where: { teacherId: user.id },
      include: { subject: true, class: { include: { academicYear: true } } },
      orderBy: { subject: { name: "asc" } },
    }),
    prisma.class.findMany({
      where: { homeroomTeacherId: user.id },
      include: {
        academicYear: true,
        students: { include: { student: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Kelas Saya"
        description="Mata pelajaran yang Anda ajar dan kelas yang Anda walikan."
      >
        <LinkButton href="/guru/classes/join">
          <PlusIcon aria-hidden="true" />
          Gabung Kelas
        </LinkButton>
      </PageHeader>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Mata Pelajaran Binaan
        </h2>
        {classSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpenIcon}
            title="Belum ada mata pelajaran"
            description="Gabung ke mata pelajaran menggunakan kode dari admin."
            action={
              <LinkButton href="/guru/classes/join">
                <PlusIcon aria-hidden="true" />
                Gabung Kelas
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classSubjects.map((cs) => (
              <Link
                key={cs.id}
                href={`/guru/classes/${cs.id}`}
                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardDescription>
                      {cs.class.name}, {cs.class.academicYear.year}{" "}
                      {semesterLabel(cs.class.academicYear.semester)}
                    </CardDescription>
                    <CardTitle>{cs.subject.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
          Wali Kelas
        </h2>
        {homerooms.length === 0 ? (
          <EmptyState
            icon={GraduationCapIcon}
            title="Belum menjadi wali kelas"
            description="Klaim wali kelas menggunakan kode dari admin."
            action={
              <LinkButton href="/guru/classes/join">
                <PlusIcon aria-hidden="true" />
                Gabung Kelas
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homerooms.map((cls) => (
              <Link
                key={cls.id}
                href={`/guru/homeroom/${cls.id}`}
                className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardDescription>
                      {cls.academicYear.year} {semesterLabel(cls.academicYear.semester)}
                    </CardDescription>
                    <CardTitle>{cls.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <UsersIcon className="size-4" aria-hidden="true" />
                      {cls.students.length} siswa
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
