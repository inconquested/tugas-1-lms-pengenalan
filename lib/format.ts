import type { Role, Semester } from "@/app/generated/prisma/client";

const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});
const dayLabelFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

/** Short axis/tooltip label for an ISO yyyy-mm-dd key, e.g. "21 Jul". */
export function formatDayLabel(key: string): string {
  return dayLabelFmt.format(new Date(`${key}T00:00:00`));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return dateFmt.format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return dateTimeFmt.format(new Date(value));
}

/** Two-letter initials for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export function roleLabel(role: Role): string {
  return { ADMIN: "Admin", GURU: "Guru", SISWA: "Siswa" }[role];
}

export function semesterLabel(semester: Semester): string {
  return { GANJIL: "Ganjil", GENAP: "Genap" }[semester];
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Human filename from a stored path or URL: last segment, query stripped. */
export function fileLabel(value: string): string {
  const last = value.split(/[\\/]/).pop()?.split("?")[0] ?? value;
  try {
    return decodeURIComponent(last) || value;
  } catch {
    return last || value;
  }
}

/** WCAG-safe predikat (grade band) for an Indonesian rapor. */
export function gradeBand(score: number | null | undefined): {
  label: string;
  predikat: "A" | "B" | "C" | "D";
} {
  if (score === null || score === undefined) return { label: "Belum dinilai", predikat: "D" };
  if (score >= 90) return { label: "Sangat Baik", predikat: "A" };
  if (score >= 80) return { label: "Baik", predikat: "B" };
  if (score >= 70) return { label: "Cukup", predikat: "C" };
  return { label: "Perlu Bimbingan", predikat: "D" };
}
