// Fabricated dashboard payloads for previewing the charts without a seeded database.
// This DELIBERATELY breaks the "real data only" policy of analytics.service — it exists
// solely for demos/screenshots and is gated behind the MOCK_ANALYTICS env flag at the
// action layer (lib/actions/analytics). The numbers are deterministic (no randomness), so
// server render and client hydration always agree. Delete this file and the flag check to
// restore the database-only behaviour.
import type {
  ClassEngagement,
  CompletionBreakdown,
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

// Day keys (yyyy-mm-dd) for the last `days` days, oldest first — mirrors analytics.service.
function dayKeys(days: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    keys.push(new Date(today.getTime() - i * DAY_MS).toISOString().slice(0, 10));
  }
  return keys;
}

// ─────────────────────────── Admin ───────────────────────────

function mockUserGrowth(): UserGrowthSeries {
  let siswa = 180;
  let guru = 18;
  let admin = 2;
  const points = dayKeys(90).map((date, i) => {
    siswa += (i % 2 === 0 ? 3 : 2) + (i % 7 === 0 ? 4 : 0);
    if (i > 0 && i % 6 === 0) guru += 1;
    if (i === 44) admin += 1;
    return { date, siswa, guru, admin };
  });
  return { points };
}

function mockLeaderboards(): LeaderboardData {
  return {
    classes: [
      { id: "cls-1", name: "XII IPA 1", detail: "2025/2026", completionPct: 96, submitted: 288, expected: 300 },
      { id: "cls-2", name: "XI IPA 2", detail: "2025/2026", completionPct: 92, submitted: 253, expected: 275 },
      { id: "cls-3", name: "XII IPS 1", detail: "2025/2026", completionPct: 88, submitted: 220, expected: 250 },
      { id: "cls-4", name: "X-3", detail: "2025/2026", completionPct: 84, submitted: 210, expected: 250 },
      { id: "cls-5", name: "XI IPS 3", detail: "2025/2026", completionPct: 79, submitted: 190, expected: 240 },
    ],
    students: [
      { id: "stu-1", name: "Aisyah Putri", average: 95.4, graded: 42 },
      { id: "stu-2", name: "Bagus Pratama", average: 93.1, graded: 39 },
      { id: "stu-3", name: "Citra Dewi", average: 91.8, graded: 45 },
      { id: "stu-4", name: "Dimas Nugroho", average: 90.2, graded: 37 },
      { id: "stu-5", name: "Elang Samudra", average: 89.6, graded: 41 },
    ],
  };
}

function mockSystemLoad(): SystemLoadMetric[] {
  return [
    { key: "storage", label: "Penyimpanan", value: 63, detail: "12,6 GB / 20 GB terpakai" },
    { key: "load", label: "Beban Server", value: 38, detail: "Rata-rata 5 menit" },
    { key: "requests", label: "Permintaan API", value: 74, detail: "7,4 rb / jam terhadap kuota" },
  ];
}

export function mockAdminStats(): {
  scale: SystemScaleDatum[];
  growth: UserGrowthSeries;
  leaderboards: LeaderboardData;
  load: SystemLoadMetric[];
} {
  const growth = mockUserGrowth();
  const last = growth.points[growth.points.length - 1];
  const scale: SystemScaleDatum[] = [
    { key: "students", label: "Siswa", value: last.siswa },
    { key: "teachers", label: "Guru", value: last.guru },
    { key: "subjects", label: "Mapel", value: 14 },
    { key: "classes", label: "Kelas", value: 18 },
    { key: "assignments", label: "Tugas", value: 356 },
    { key: "submissions", label: "Pengumpulan", value: 5820 },
  ];
  return { scale, growth, leaderboards: mockLeaderboards(), load: mockSystemLoad() };
}

// ─────────────────────────── Teacher ───────────────────────────

function mockGradeDistribution(): GradeDistribution {
  const bands = [
    { band: "A" as const, label: "A · Sangat Baik", count: 48 },
    { band: "B" as const, label: "B · Baik", count: 63 },
    { band: "C" as const, label: "C · Cukup", count: 29 },
    { band: "D" as const, label: "D · Perlu Bimbingan", count: 10 },
  ];
  return { total: bands.reduce((s, b) => s + b.count, 0), bands };
}

function mockCompletion(): CompletionBreakdown {
  // graded + submitted + pending === expected (as the real aggregation guarantees).
  return { graded: 96, submitted: 24, pending: 30, expected: 150 };
}

function mockEngagement(): ClassEngagement {
  return {
    classes: [
      { id: "cs-1", className: "XII IPA 1", subjectName: "Matematika Peminatan", students: 30, avgGrade: 87.5 },
      { id: "cs-2", className: "XII IPA 2", subjectName: "Matematika Peminatan", students: 28, avgGrade: 82.3 },
      { id: "cs-3", className: "XI IPA 1", subjectName: "Matematika Wajib", students: 32, avgGrade: 79.1 },
      { id: "cs-4", className: "X-4", subjectName: "Matematika Wajib", students: 34, avgGrade: null },
    ],
  };
}

export function mockTeacherAnalytics(): {
  distribution: GradeDistribution;
  completion: CompletionBreakdown;
  engagement: ClassEngagement;
} {
  return {
    distribution: mockGradeDistribution(),
    completion: mockCompletion(),
    engagement: mockEngagement(),
  };
}

// ─────────────────────────── Student ───────────────────────────

function mockGradeTimeline(): GradeTimeline {
  const items = [
    { title: "Ulangan Harian 1", subject: "Matematika", grade: 78 },
    { title: "Tugas Proyek Aljabar", subject: "Matematika", grade: 85 },
    { title: "Praktikum Gerak", subject: "Fisika", grade: 80 },
    { title: "Kuis Termodinamika", subject: "Fisika", grade: 88 },
    { title: "Esai Sejarah", subject: "Sejarah", grade: 90 },
    { title: "Presentasi Kelompok", subject: "Bahasa Indonesia", grade: 92 },
    { title: "Ulangan Harian 2", subject: "Matematika", grade: 84 },
    { title: "Laporan Praktikum", subject: "Biologi", grade: 87 },
    { title: "Kuis Sel", subject: "Biologi", grade: 91 },
    { title: "Latihan Soal Vektor", subject: "Fisika", grade: 83 },
    { title: "Analisis Cerpen", subject: "Bahasa Indonesia", grade: 89 },
    { title: "Ujian Tengah Semester", subject: "Matematika", grade: 93 },
  ];
  const today = new Date();
  const points = items.map((it, i) => {
    // one graded assignment roughly every 9 days, oldest first
    const offset = (items.length - 1 - i) * 9;
    const key = new Date(today.getTime() - offset * DAY_MS).toISOString().slice(0, 10);
    return { date: key, label: key.slice(5), grade: it.grade, title: it.title, subject: it.subject };
  });
  return { points };
}

// Derived from the timeline the same way analytics.service aggregates real submissions.
function mockSubjectAverages(timeline: GradeTimeline): SubjectAverages {
  const totals = new Map<string, { sum: number; n: number }>();
  for (const p of timeline.points) {
    const cur = totals.get(p.subject) ?? { sum: 0, n: 0 };
    cur.sum += p.grade;
    cur.n += 1;
    totals.set(p.subject, cur);
  }
  return {
    subjects: [...totals.entries()].map(([subject, { sum, n }]) => ({
      subject,
      average: Math.round((sum / n) * 10) / 10,
    })),
  };
}

function mockWorkload(): WorkloadBreakdown {
  // graded + submitted + pending === total.
  return { graded: 12, submitted: 3, pending: 7, total: 22 };
}

// A gently rising rapor average across four terms, so the trend + delta read well in demos.
function mockSemesterAverages(): SemesterAverages {
  return {
    terms: [
      { yearId: "ay-1", year: "2023/2024", semester: "Ganjil", label: "2023/2024 Ganjil", average: 82.4, subjects: 9 },
      { yearId: "ay-2", year: "2023/2024", semester: "Genap", label: "2023/2024 Genap", average: 84.1, subjects: 9 },
      { yearId: "ay-3", year: "2024/2025", semester: "Ganjil", label: "2024/2025 Ganjil", average: 86.7, subjects: 10 },
      { yearId: "ay-4", year: "2024/2025", semester: "Genap", label: "2024/2025 Genap", average: 88.9, subjects: 10 },
    ],
  };
}

export function mockStudentProgress(): {
  timeline: GradeTimeline;
  subjects: SubjectAverages;
  workload: WorkloadBreakdown;
  semesters: SemesterAverages;
} {
  const timeline = mockGradeTimeline();
  return {
    timeline,
    subjects: mockSubjectAverages(timeline),
    workload: mockWorkload(),
    semesters: mockSemesterAverages(),
  };
}
