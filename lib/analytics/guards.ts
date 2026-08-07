// Emptiness check shared by every dashboard chart. A chart calls `hasData(payload)` and, when
// it returns false, renders an <EmptyChartState/> instead of a chart canvas. Covers all the
// analytics payload shapes (arrays of counts, point series, band totals, donut breakdowns,
// leaderboard lists) so a single guard reads naturally at each call site.
export function hasData(payload: unknown): boolean {
  if (payload == null) return false;

  // Count arrays (system scale): meaningful only when at least one entity exists.
  if (Array.isArray(payload)) {
    return payload.some((item) =>
      item && typeof item === "object" && "value" in item
        ? Number((item as { value: number }).value) > 0
        : item != null,
    );
  }

  if (typeof payload !== "object") return false;
  const o = payload as Record<string, unknown>;

  // Point series (grade timeline, user growth): any non-zero data point.
  if (Array.isArray(o.points)) {
    return (o.points as Record<string, unknown>[]).some((p) =>
      "grade" in p
        ? Number(p.grade) > 0
        : Number(p.siswa ?? 0) + Number(p.guru ?? 0) + Number(p.admin ?? 0) > 0,
    );
  }

  // Band / donut breakdowns keyed by a total or expected count.
  if (typeof o.total === "number") return o.total > 0;
  if (typeof o.expected === "number") return o.expected > 0;

  // List payloads (subject averages, leaderboards, class engagement).
  if (Array.isArray(o.subjects)) return o.subjects.length > 0;
  if (Array.isArray(o.classes) || Array.isArray(o.students)) {
    return (
      ((o.classes as unknown[] | undefined)?.length ?? 0) > 0 ||
      ((o.students as unknown[] | undefined)?.length ?? 0) > 0
    );
  }

  return false;
}
