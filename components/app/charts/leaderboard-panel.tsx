"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import { hasData } from "@/lib/analytics/guards";
import type { LeaderboardData } from "@/lib/analytics/types";

// Fast performance lookup: top classes by completion rate and top students by average grade,
// with a live client filter over the student list.
export function LeaderboardPanel({ data }: { data: LeaderboardData }) {
  const [query, setQuery] = useState("");
  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter((s) => s.name.toLowerCase().includes(q));
  }, [data.students, query]);

  return (
    <ChartCard
      title="Pencarian Cepat Prestasi"
      description="Kelas dengan penyelesaian tugas tertinggi dan siswa dengan nilai tertinggi."
    >
      {!hasData(data) ? (
        <EmptyChartState
          height={220}
          title="Belum ada prestasi tercatat"
          message="Peringkat muncul setelah ada tugas yang dikumpulkan dan dinilai."
        />
      ) : (
      <div className="grid gap-6 py-1 md:grid-cols-2">
        <section aria-labelledby="lb-classes" className="grid content-start gap-2">
          <h3
            id="lb-classes"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Kelas · Penyelesaian tertinggi
          </h3>
          <ol className="grid gap-2">
            {data.classes.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Belum ada data kelas.
              </li>
            ) : (
              data.classes.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {c.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {c.submitted}/{c.expected} tugas · {c.detail}
                    </span>
                  </span>
                  <Badge variant="secondary" className="tabular-nums">
                    {c.completionPct}%
                  </Badge>
                </li>
              ))
            )}
          </ol>
        </section>

        <section aria-labelledby="lb-students" className="grid content-start gap-2">
          <h3
            id="lb-students"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Siswa · Nilai tertinggi
          </h3>
          <Input
            aria-label="Cari siswa"
            placeholder="Cari siswa..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <ol className="grid gap-2">
            {students.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Tidak ada siswa yang cocok.
              </li>
            ) : (
              students.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {s.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {s.graded} nilai masuk
                    </span>
                  </span>
                  <Badge className="tabular-nums">{s.average}</Badge>
                </li>
              ))
            )}
          </ol>
        </section>
      </div>
      )}
    </ChartCard>
  );
}
