import { TIME_RANGES, type TimeRange } from "@/lib/analytics/types";

const DAY_MS = 86_400_000;

// Keep only the points inside `range`, measured back from the most recent point (not the
// wall clock). Data-relative so server render and client hydration always agree.
export function filterByRange<T extends { date: string }>(
  points: T[],
  range: TimeRange,
): T[] {
  const days = TIME_RANGES.find((r) => r.key === range)?.days ?? null;
  if (!days || points.length === 0) return points;

  const last = points[points.length - 1].date;
  const cutoff = new Date(new Date(`${last}T00:00:00Z`).getTime() - days * DAY_MS)
    .toISOString()
    .slice(0, 10);
  return points.filter((p) => p.date >= cutoff);
}
