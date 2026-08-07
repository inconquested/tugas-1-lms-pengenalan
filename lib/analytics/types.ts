// Payload contracts for the dashboard visualizations. Kept UI-agnostic so the server
// aggregations (analytics.service) and the chart components share one shape.
//
// Datasets carry only real, database-derived numbers. When a query finds nothing the
// aggregation returns an empty/zero-filled payload and the chart renders a dedicated
// empty state (see components/app/charts/chart-empty-state) instead of fabricated data.

export type TimeRange = "7d" | "30d" | "semester" | "all";

export const TIME_RANGES: { key: TimeRange; label: string; days: number | null }[] = [
  { key: "7d", label: "7 Hari", days: 7 },
  { key: "30d", label: "30 Hari", days: 30 },
  { key: "semester", label: "Semester", days: 180 },
  { key: "all", label: "Semua", days: null },
];

// --- Admin ---

export interface SystemScaleDatum {
  key: string;
  label: string;
  value: number;
}

export interface UserGrowthPoint {
  /** ISO yyyy-mm-dd */
  date: string;
  siswa: number;
  guru: number;
  admin: number;
}

export interface UserGrowthSeries {
  points: UserGrowthPoint[];
}

export interface RankedClass {
  id: string;
  name: string;
  detail: string;
  completionPct: number;
  submitted: number;
  expected: number;
}

export interface RankedStudent {
  id: string;
  name: string;
  average: number;
  graded: number;
}

export interface LeaderboardData {
  classes: RankedClass[];
  students: RankedStudent[];
}

export interface SystemLoadMetric {
  key: string;
  label: string;
  /** 0..100 */
  value: number;
  detail: string;
}

// --- Teacher ---

export type GradeBandKey = "A" | "B" | "C" | "D";

export interface GradeBandDatum {
  band: GradeBandKey;
  label: string;
  count: number;
}

export interface GradeDistribution {
  total: number;
  bands: GradeBandDatum[];
}

export interface CompletionBreakdown {
  /** submitted and scored */
  graded: number;
  /** submitted, awaiting a score */
  submitted: number;
  /** expected but not submitted */
  pending: number;
  expected: number;
}

export interface ClassEngagementDatum {
  id: string;
  className: string;
  subjectName: string;
  students: number;
  avgGrade: number | null;
}

export interface ClassEngagement {
  classes: ClassEngagementDatum[];
}

// --- Student ---

export interface GradeTimelinePoint {
  /** ISO yyyy-mm-dd */
  date: string;
  label: string;
  grade: number;
  title: string;
  subject: string;
}

export interface GradeTimeline {
  points: GradeTimelinePoint[];
}

export interface SubjectAverageDatum {
  subject: string;
  average: number;
}

export interface SubjectAverages {
  subjects: SubjectAverageDatum[];
}

export interface WorkloadBreakdown {
  graded: number;
  submitted: number;
  pending: number;
  total: number;
}

export interface SemesterAverageDatum {
  yearId: string;
  /** Academic year label, e.g. "2024/2025". */
  year: string;
  /** Localized semester name, e.g. "Ganjil". */
  semester: string;
  /** Full term label for tooltips, e.g. "2024/2025 Ganjil". */
  label: string;
  /** Mean of the student's finalScore across graded subjects that term (1 dp). */
  average: number;
  /** Number of graded subjects contributing to the mean. */
  subjects: number;
}

export interface SemesterAverages {
  /** Chronological, oldest term first — the student's rapor average over time. */
  terms: SemesterAverageDatum[];
}
