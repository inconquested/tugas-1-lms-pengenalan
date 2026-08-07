"use server";

// Server Actions that back the role dashboards. Each returns a uniform
// `{ data, error }` envelope so the calling server component can render an
// error/empty state without a try/catch at the call site. Database access stays
// isolated here and in the analytics service — never touched from the client.
import { requireRole } from "@/lib/auth";
import * as svc from "@/lib/services/analytics.service";
import {
  mockAdminStats,
  mockStudentProgress,
  mockTeacherAnalytics,
} from "@/lib/analytics/mock";
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

export type ActionResult<T> = { data: T | null; error: string | null };

// Demo/preview switch: when MOCK_ANALYTICS=1, the dashboards render fabricated sample data
// instead of database aggregations. The role gate still runs first, so only the right role
// sees each payload. See lib/analytics/mock. Leave unset in production.
const USE_MOCK = process.env.MOCK_ANALYTICS === "1";

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Gagal memuat data analitik.",
    };
  }
}

export interface AdminDashboardStats {
  scale: SystemScaleDatum[];
  growth: UserGrowthSeries;
  leaderboards: LeaderboardData;
  load: SystemLoadMetric[];
}

export async function getAdminDashboardStats(
  activeYearId?: string,
): Promise<ActionResult<AdminDashboardStats>> {
  return run(async () => {
    await requireRole("ADMIN");
    if (USE_MOCK) return mockAdminStats();
    const [scale, growth, leaderboards] = await Promise.all([
      svc.getSystemScale(activeYearId),
      svc.getUserGrowth(),
      svc.getLeaderboards(),
    ]);
    return { scale, growth, leaderboards, load: svc.getSystemLoad() };
  });
}

export interface TeacherAnalytics {
  distribution: GradeDistribution;
  completion: CompletionBreakdown;
  engagement: ClassEngagement;
}

// Scoped to the signed-in teacher: since Server Actions are POST-callable endpoints, the
// teacher id is taken from the session, never from an argument, to avoid cross-account reads.
export async function getTeacherAnalytics(): Promise<ActionResult<TeacherAnalytics>> {
  return run(async () => {
    const teacher = await requireRole("GURU");
    if (USE_MOCK) return mockTeacherAnalytics();
    const [distribution, completion, engagement] = await Promise.all([
      svc.getTeacherGradeDistribution(teacher.id),
      svc.getTeacherCompletion(teacher.id),
      svc.getTeacherEngagement(teacher.id),
    ]);
    return { distribution, completion, engagement };
  });
}

export interface StudentProgress {
  timeline: GradeTimeline;
  subjects: SubjectAverages;
  workload: WorkloadBreakdown;
  semesters: SemesterAverages;
}

// Scoped to the signed-in student for the same reason as getTeacherAnalytics.
export async function getStudentProgress(): Promise<ActionResult<StudentProgress>> {
  return run(async () => {
    const student = await requireRole("SISWA");
    if (USE_MOCK) return mockStudentProgress();
    const [timeline, subjects, workload, semesters] = await Promise.all([
      svc.getStudentGradeTimeline(student.id),
      svc.getStudentSubjectAverages(student.id),
      svc.getStudentWorkload(student.id),
      svc.getStudentSemesterAverages(student.id),
    ]);
    return { timeline, subjects, workload, semesters };
  });
}
