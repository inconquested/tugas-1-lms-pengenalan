import { SchoolIcon, UsersIcon } from "lucide-react";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import type { ClassEngagement } from "@/lib/analytics/types";

// Roster snapshot: enrolled students and average grade (engagement proxy) per class-subject.
export function ClassEngagementGrid({ data }: { data: ClassEngagement }) {
  if (data.classes.length === 0) {
    return (
      <ChartCard
        title="Roster & Keterlibatan Kelas"
        description="Jumlah siswa dan rata-rata nilai tiap kelas binaan."
      >
        <EmptyChartState
          icon={SchoolIcon}
          height={160}
          title="Belum ada kelas binaan"
          message="Gabung ke mata pelajaran menggunakan kode dari admin untuk melihat roster."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Roster & Keterlibatan Kelas"
      description="Jumlah siswa dan rata-rata nilai tiap kelas binaan."
    >
      <div className="grid gap-3 py-1 sm:grid-cols-2 xl:grid-cols-3">
        {data.classes.map((c) => (
          <div
            key={c.id}
            className="grid gap-2 rounded-lg border border-border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.subjectName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {c.className}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UsersIcon className="size-3.5" aria-hidden="true" />
              {c.students} siswa
            </p>
            {c.avgGrade != null ? (
              <div className="grid gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rata-rata nilai</span>
                  <span className="font-medium tabular-nums">{c.avgGrade}</span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`Rata-rata nilai ${c.subjectName}`}
                  aria-valuenow={Math.round(c.avgGrade)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, c.avgGrade)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Belum ada nilai.</p>
            )}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
