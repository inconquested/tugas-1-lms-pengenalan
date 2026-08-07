// Read-only aggregations powering the role dashboards. Everything here is derived from the
// existing schema (users, classes, assignments, submissions, rapor). When a query yields no
// rows we return an empty/zero-filled payload so the chart can render a dedicated empty
// state; we never substitute fabricated sample numbers for real data.
import { prisma } from "@/lib/prisma";
import { gradeBand, semesterLabel } from "@/lib/format";
import type { Semester } from "@/app/generated/prisma/client";
import type {
  ClassEngagement,
  CompletionBreakdown,
  GradeBandKey,
  GradeDistribution,
  GradeTimeline,
  LeaderboardData,
  SemesterAverages,
  SubjectAverages,
  SystemLoadMetric,
  SystemScaleDatum,
  UserGrowthSeries,
  WorkloadBreakdown,
} from "@/lib/analytics/types";

const DAY_MS = 86_400_000;

// The only non-DB metric on the dashboards: this app exposes no server telemetry, so the
// resource gauges are a fixed simulation, badged "Simulasi" in the UI (SystemLoadPanel).
const SYSTEM_LOAD_METRICS: SystemLoadMetric[] = [
  { key: "storage", label: "Penyimpanan", value: 63, detail: "12,6 GB / 20 GB terpakai" },
  { key: "load", label: "Beban Server", value: 38, detail: "Rata-rata 5 menit" },
  { key: "requests", label: "Permintaan API", value: 74, detail: "7,4 rb / jam terhadap kuota" },
];

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayKeys(days: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    keys.push(toKey(d));
  }
  return keys;
}

// ─────────────────────────── Admin ───────────────────────────

export async function getSystemScale(
  activeAcademicYearId?: string,
): Promise<SystemScaleDatum[]> {
  const [teachers, students, subjects, classes, assignments, submissions] =
    await Promise.all([
      prisma.user.count({ where: { role: "GURU" } }),
      prisma.user.count({ where: { role: "SISWA" } }),
      prisma.subject.count(),
      prisma.class.count(
        activeAcademicYearId
          ? { where: { academicYearId: activeAcademicYearId } }
          : undefined,
      ),
      prisma.assignment.count(),
      prisma.submission.count(),
    ]);

  return [
    { key: "students", label: "Siswa", value: students },
    { key: "teachers", label: "Guru", value: teachers },
    { key: "subjects", label: "Mapel", value: subjects },
    { key: "classes", label: "Kelas", value: classes },
    { key: "assignments", label: "Tugas", value: assignments },
    { key: "submissions", label: "Pengumpulan", value: submissions },
  ];
}

export async function getUserGrowth(): Promise<UserGrowthSeries> {
  const users = await prisma.user.findMany({
    select: { createdAt: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const first = users[0]?.createdAt;
  const spanDays = first
    ? Math.ceil((Date.now() - first.getTime()) / DAY_MS) + 1
    : 30;
  const days = Math.min(365, Math.max(30, spanDays));
  const keys = dayKeys(days);

  const points = keys.map((key) => {
    const end = new Date(`${key}T23:59:59.999Z`).getTime();
    let siswa = 0;
    let guru = 0;
    let admin = 0;
    for (const u of users) {
      if (u.createdAt.getTime() > end) break; // sorted ascending
      if (u.role === "SISWA") siswa++;
      else if (u.role === "GURU") guru++;
      else admin++;
    }
    return { date: key, siswa, guru, admin };
  });

  return { points };
}

export async function getLeaderboards(): Promise<LeaderboardData> {
  const [studentRows, classes] = await Promise.all([
    prisma.submission.groupBy({
      by: ["studentId"],
      where: { grade: { not: null } },
      _avg: { grade: true },
      _count: { _all: true },
      orderBy: { _avg: { grade: "desc" } },
      take: 5,
    }),
    prisma.class.findMany({
      include: {
        academicYear: true,
        _count: { select: { students: true } },
        classSubjects: {
          select: {
            _count: { select: { assignments: true } },
            assignments: { select: { _count: { select: { submissions: true } } } },
          },
        },
      },
    }),
  ]);

  const rankedClasses = classes
    .map((c) => {
      const totalAssignments = c.classSubjects.reduce(
        (sum, cs) => sum + cs._count.assignments,
        0,
      );
      const submitted = c.classSubjects.reduce(
        (sum, cs) =>
          sum + cs.assignments.reduce((s, a) => s + a._count.submissions, 0),
        0,
      );
      const expected = c._count.students * totalAssignments;
      return {
        id: c.id,
        name: c.name,
        detail: c.academicYear.year,
        completionPct: expected > 0 ? Math.round((submitted / expected) * 100) : 0,
        submitted,
        expected,
      };
    })
    .filter((c) => c.expected > 0)
    .sort((a, b) => b.completionPct - a.completionPct || b.submitted - a.submitted)
    .slice(0, 5);

  if (studentRows.length === 0 && rankedClasses.length === 0) {
    return { classes: [], students: [] };
  }

  const names = await prisma.user.findMany({
    where: { id: { in: studentRows.map((r) => r.studentId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(names.map((n) => [n.id, n.name]));

  return {
    classes: rankedClasses,
    students: studentRows.map((r) => ({
      id: r.studentId,
      name: nameById.get(r.studentId) ?? "Siswa",
      average: Math.round((r._avg.grade ?? 0) * 10) / 10,
      graded: r._count._all,
    })),
  };
}

export function getSystemLoad(): SystemLoadMetric[] {
  return SYSTEM_LOAD_METRICS;
}

// ─────────────────────────── Teacher ───────────────────────────

const BAND_LABEL: Record<GradeBandKey, string> = {
  A: "A · Sangat Baik",
  B: "B · Baik",
  C: "C · Cukup",
  D: "D · Perlu Bimbingan",
};

export async function getTeacherGradeDistribution(
  teacherId: string,
): Promise<GradeDistribution> {
  const subs = await prisma.submission.findMany({
    where: { grade: { not: null }, assignment: { classSubject: { teacherId } } },
    select: { grade: true },
  });

  const counts: Record<GradeBandKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const s of subs) counts[gradeBand(s.grade).predikat] += 1;

  const bands = (Object.keys(counts) as GradeBandKey[]).map((band) => ({
    band,
    label: BAND_LABEL[band],
    count: counts[band],
  }));

  return { total: subs.length, bands };
}

export async function getTeacherCompletion(
  teacherId: string,
): Promise<CompletionBreakdown> {
  const [assignments, submitted, graded] = await Promise.all([
    prisma.assignment.findMany({
      where: { classSubject: { teacherId } },
      select: {
        classSubject: {
          select: { class: { select: { _count: { select: { students: true } } } } },
        },
      },
    }),
    prisma.submission.count({
      where: { assignment: { classSubject: { teacherId } } },
    }),
    prisma.submission.count({
      where: { grade: { not: null }, assignment: { classSubject: { teacherId } } },
    }),
  ]);

  const expected = assignments.reduce(
    (sum, a) => sum + a.classSubject.class._count.students,
    0,
  );

  return {
    graded,
    submitted: Math.max(0, submitted - graded),
    pending: Math.max(0, expected - submitted),
    expected,
  };
}

export async function getTeacherEngagement(
  teacherId: string,
): Promise<ClassEngagement> {
  const classSubjects = await prisma.classSubject.findMany({
    where: { teacherId },
    include: {
      subject: { select: { name: true } },
      class: {
        select: { name: true, _count: { select: { students: true } } },
      },
    },
    orderBy: { subject: { name: "asc" } },
  });

  if (classSubjects.length === 0) return { classes: [] };

  const avgRows = await prisma.raporComponent.groupBy({
    by: ["classSubjectId"],
    where: {
      classSubjectId: { in: classSubjects.map((cs) => cs.id) },
      finalScore: { not: null },
    },
    _avg: { finalScore: true },
  });
  const avgById = new Map(avgRows.map((r) => [r.classSubjectId, r._avg.finalScore]));

  return {
    classes: classSubjects.map((cs) => {
      const avg = avgById.get(cs.id);
      return {
        id: cs.id,
        className: cs.class.name,
        subjectName: cs.subject.name,
        students: cs.class._count.students,
        avgGrade: avg != null ? Math.round(avg * 10) / 10 : null,
      };
    }),
  };
}

// ─────────────────────────── Student ───────────────────────────

export async function getStudentGradeTimeline(
  studentId: string,
): Promise<GradeTimeline> {
  const subs = await prisma.submission.findMany({
    where: { studentId, grade: { not: null } },
    include: {
      assignment: {
        select: {
          title: true,
          classSubject: { select: { subject: { select: { name: true } } } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return {
    points: subs.map((s) => {
      const key = toKey(s.submittedAt);
      return {
        date: key,
        label: key.slice(5),
        grade: s.grade ?? 0,
        title: s.assignment.title,
        subject: s.assignment.classSubject.subject.name,
      };
    }),
  };
}

export async function getStudentSubjectAverages(
  studentId: string,
): Promise<SubjectAverages> {
  const subs = await prisma.submission.findMany({
    where: { studentId, grade: { not: null } },
    select: {
      grade: true,
      assignment: {
        select: { classSubject: { select: { subject: { select: { name: true } } } } },
      },
    },
  });

  const totals = new Map<string, { sum: number; n: number }>();
  for (const s of subs) {
    const name = s.assignment.classSubject.subject.name;
    const cur = totals.get(name) ?? { sum: 0, n: 0 };
    cur.sum += s.grade ?? 0;
    cur.n += 1;
    totals.set(name, cur);
  }

  return {
    subjects: [...totals.entries()].map(([subject, { sum, n }]) => ({
      subject,
      average: Math.round((sum / n) * 10) / 10,
    })),
  };
}

export async function getStudentWorkload(
  studentId: string,
): Promise<WorkloadBreakdown> {
  const enrollments = await prisma.classStudent.findMany({
    where: { studentId },
    select: { class: { select: { classSubjects: { select: { id: true } } } } },
  });
  const csIds = enrollments.flatMap((e) =>
    e.class.classSubjects.map((cs) => cs.id),
  );

  const assignments = await prisma.assignment.findMany({
    where: { classSubjectId: { in: csIds } },
    select: { submissions: { where: { studentId }, select: { grade: true } } },
  });

  let graded = 0;
  let submitted = 0;
  let pending = 0;
  for (const a of assignments) {
    const sub = a.submissions[0];
    if (!sub) pending += 1;
    else if (sub.grade != null) graded += 1;
    else submitted += 1;
  }

  return { graded, submitted, pending, total: assignments.length };
}

// The student's rapor final score averaged across subjects, per academic-year term —
// the "semester average" they track over time. Only scored components (finalScore set)
// count, so a half-filled rapor never drags the mean toward zero.
const SEMESTER_ORDER: Record<Semester, number> = { GANJIL: 0, GENAP: 1 };

export async function getStudentSemesterAverages(
  studentId: string,
): Promise<SemesterAverages> {
  const components = await prisma.raporComponent.findMany({
    where: { studentId, finalScore: { not: null } },
    select: {
      finalScore: true,
      classSubject: {
        select: {
          class: {
            select: {
              academicYear: {
                select: { id: true, year: true, semester: true },
              },
            },
          },
        },
      },
    },
  });

  const byYear = new Map<
    string,
    { year: string; semester: Semester; sum: number; n: number }
  >();
  for (const c of components) {
    const ay = c.classSubject.class.academicYear;
    const cur = byYear.get(ay.id) ?? {
      year: ay.year,
      semester: ay.semester,
      sum: 0,
      n: 0,
    };
    cur.sum += c.finalScore ?? 0;
    cur.n += 1;
    byYear.set(ay.id, cur);
  }

  const terms = [...byYear.entries()]
    .sort(
      ([, a], [, b]) =>
        a.year.localeCompare(b.year) ||
        SEMESTER_ORDER[a.semester] - SEMESTER_ORDER[b.semester],
    )
    .map(([yearId, v]) => ({
      yearId,
      year: v.year,
      semester: semesterLabel(v.semester),
      label: `${v.year} ${semesterLabel(v.semester)}`,
      average: Math.round((v.sum / v.n) * 10) / 10,
      subjects: v.n,
    }));

  return { terms };
}
