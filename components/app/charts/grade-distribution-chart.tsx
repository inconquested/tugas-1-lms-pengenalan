"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import { hasData } from "@/lib/analytics/guards";
import type { GradeBandKey, GradeDistribution } from "@/lib/analytics/types";

const BAND_COLOR: Record<GradeBandKey, string> = {
  A: "var(--chart-5)",
  B: "var(--chart-4)",
  C: "var(--chart-2)",
  D: "var(--chart-3)",
};

const BAND_FULL: Record<GradeBandKey, string> = {
  A: "Sangat Baik",
  B: "Baik",
  C: "Cukup",
  D: "Perlu Bimbingan",
};

const config = {
  count: { label: "Jumlah siswa" },
} satisfies ChartConfig;

export function GradeDistributionChart({ data }: { data: GradeDistribution }) {
  return (
    <ChartCard
      title="Distribusi Nilai"
      description={
        hasData(data)
          ? `Sebaran predikat dari ${data.total} penilaian tugas.`
          : "Sebaran predikat penilaian tugas."
      }
    >
      {!hasData(data) ? (
        <EmptyChartState
          height={240}
          title="Belum ada nilai"
          message="Distribusi predikat muncul setelah Anda menilai tugas siswa."
        />
      ) : (
      <ChartContainer config={config} className="h-[240px] w-full">
        <BarChart accessibilityLayer data={data.bands} margin={{ left: 4, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="band" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(v) =>
                  `${v} · ${BAND_FULL[v as GradeBandKey] ?? ""}`
                }
              />
            }
          />
          <Bar dataKey="count" radius={6}>
            {data.bands.map((b) => (
              <Cell key={b.band} fill={BAND_COLOR[b.band]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      )}
    </ChartCard>
  );
}
