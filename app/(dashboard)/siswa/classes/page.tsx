import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  CalendarClockIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  SchoolIcon,
  TicketIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getClerkAvatarMap } from "@/lib/clerk-avatars";
import { formatDate, formatScore, semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { UserAvatar } from "@/components/app/user-avatar";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Kelas Saya" };

type Metrics = { pending: number; nextDue: Date | null; avgGrade: number | null };

function Pill({
  icon: Icon,
  children,
  tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: "muted" | "warning" | "success";
}) {
  const tones = {
    muted: "border-border bg-muted/40 text-muted-foreground",
    warning: "border-warning/30 bg-warning/10 text-warning",
    success: "border-success/30 bg-success/10 text-success",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

export default async function SiswaClassesPage() {
  const user = await requireRole("SISWA");

  const enrollments = await prisma.classStudent.findMany({
    where: { studentId: user.id },
    include: {
      class: {
        include: {
          academicYear: true,
          homeroomTeacher: true,
          classSubjects: { include: { subject: true } },
        },
      },
    },
    orderBy: { class: { name: "asc" } },
  });

  const csIds = enrollments.flatMap((e) =>
    e.class.classSubjects.map((cs) => cs.id),
  );
  const now = new Date();

  const [assignments, submissions] = await Promise.all([
    prisma.assignment.findMany({
      where: { classSubjectId: { in: csIds } },
      select: { id: true, classSubjectId: true, dueDate: true },
    }),
    prisma.submission.findMany({
      where: {
        studentId: user.id,
        assignment: { classSubjectId: { in: csIds } },
      },
      select: {
        assignmentId: true,
        grade: true,
        assignment: { select: { classSubjectId: true } },
      },
    }),
  ]);

  const submittedByCs = new Map<string, Set<string>>();
  const gradesByCs = new Map<string, number[]>();
  for (const s of submissions) {
    const cs = s.assignment.classSubjectId;
    (submittedByCs.get(cs) ?? submittedByCs.set(cs, new Set()).get(cs)!).add(
      s.assignmentId,
    );
    if (s.grade != null) {
      (gradesByCs.get(cs) ?? gradesByCs.set(cs, []).get(cs)!).push(s.grade);
    }
  }

  const assignmentsByCs = new Map<string, { id: string; dueDate: Date | null }[]>();
  for (const a of assignments) {
    (
      assignmentsByCs.get(a.classSubjectId) ??
      assignmentsByCs.set(a.classSubjectId, []).get(a.classSubjectId)!
    ).push(a);
  }

  const metricsByCs = new Map<string, Metrics>();
  for (const csId of csIds) {
    const list = assignmentsByCs.get(csId) ?? [];
    const submitted = submittedByCs.get(csId) ?? new Set<string>();
    const pendingList = list.filter((a) => !submitted.has(a.id));
    const nextDue =
      pendingList
        .map((a) => a.dueDate)
        .filter((d): d is Date => d != null && d >= now)
        .sort((x, y) => x.getTime() - y.getTime())[0] ?? null;
    const gl = gradesByCs.get(csId) ?? [];
    const avgGrade = gl.length
      ? gl.reduce((sum, g) => sum + g, 0) / gl.length
      : null;
    metricsByCs.set(csId, { pending: pendingList.length, nextDue, avgGrade });
  }

  const avatars = await getClerkAvatarMap(
    enrollments.map((e) => e.class.homeroomTeacher?.clerkId),
  );

  const joinButton = (
    <LinkButton href="/siswa/classes/join">
      <TicketIcon aria-hidden="true" />
      Gabung kelas
    </LinkButton>
  );

  return (
    <>
      <PageHeader
        title="Kelas Saya"
        description="Seluruh mata pelajaran dari kelas yang kamu ikuti."
      >
        {joinButton}
      </PageHeader>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="Belum ada kelas"
          description="Kamu belum bergabung ke kelas mana pun. Gunakan kode kelas dari guru untuk bergabung."
          action={joinButton}
        />
      ) : (
        <div className="grid gap-8">
          {enrollments.map((e) => {
            const homeroom = e.class.homeroomTeacher;
            return (
              <section key={e.id} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="grid gap-0.5">
                    <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
                      {e.class.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {e.class.academicYear.year} - Semester{" "}
                      {semesterLabel(e.class.academicYear.semester)}
                    </p>
                  </div>
                  {homeroom ? (
                    <span className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1">
                      <UserAvatar
                        name={homeroom.name}
                        src={avatars.get(homeroom.clerkId)}
                        size="sm"
                      />
                      <span className="grid leading-tight">
                        <span className="text-[0.6875rem] text-muted-foreground">
                          Wali kelas
                        </span>
                        <span className="text-xs font-medium">
                          {homeroom.name}
                        </span>
                      </span>
                    </span>
                  ) : null}
                </div>

                {e.class.classSubjects.length === 0 ? (
                  <EmptyState
                    icon={BookOpenIcon}
                    title="Belum ada mata pelajaran"
                    description="Kelas ini belum memiliki mata pelajaran."
                    compact
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {e.class.classSubjects.map((cs) => {
                      const m =
                        metricsByCs.get(cs.id) ??
                        ({ pending: 0, nextDue: null, avgGrade: null } as Metrics);
                      return (
                        <Link
                          key={cs.id}
                          href={`/siswa/classes/${cs.id}`}
                          className="group block"
                        >
                          <Card className="h-full transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-active:scale-100">
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <span
                                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
                                  aria-hidden="true"
                                >
                                  <BookOpenIcon className="size-5" />
                                </span>
                                <div className="min-w-0">
                                  <CardTitle className="truncate text-base">
                                    {cs.subject.name}
                                  </CardTitle>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {e.class.name}
                                  </p>
                                </div>
                              </div>
                              <CardAction>
                                <Badge variant="success">Terdaftar</Badge>
                              </CardAction>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                              <Pill
                                icon={ClipboardListIcon}
                                tone={m.pending > 0 ? "warning" : "muted"}
                              >
                                {m.pending > 0
                                  ? `${m.pending} tugas aktif`
                                  : "Tugas beres"}
                              </Pill>
                              {m.nextDue ? (
                                <Pill icon={CalendarClockIcon}>
                                  {formatDate(m.nextDue)}
                                </Pill>
                              ) : null}
                              {m.avgGrade != null ? (
                                <Pill icon={GraduationCapIcon} tone="success">
                                  Rata-rata {formatScore(m.avgGrade)}
                                </Pill>
                              ) : null}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
