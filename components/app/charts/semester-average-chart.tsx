"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import { GradeBadge } from "@/components/app/grade-badge";
import { formatScore, gradeBand } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GradeBandKey, SemesterAverages } from "@/lib/analytics/types";

// Bars carry the same predikat palette as the teacher's distribution chart, so a green bar
// means the same thing everywhere.
const BAND_COLOR: Record<GradeBandKey, string> = {
  A: "var(--chart-5)",
  B: "var(--chart-4)",
  C: "var(--chart-2)",
  D: "var(--chart-3)",
};

const config = {
  average: { label: "Rata-rata" },
} satisfies ChartConfig;

// "2024/2025" -> "24/25": a compact axis tick; the tooltip keeps the full term label.
function shortYear(year: string): string {
  return year
    .split("/")
    .map((p) => p.slice(-2))
    .join("/");
}

/**
 * The student's rapor average per semester: the latest term as an at-a-glance headline
 * (score + predikat + change since last term), above a bar trend across every term so
 * they can watch their performance move over time. Empty until a rapor is scored.
 */
export function SemesterAverageChart({ data }: { data: SemesterAverages }) {
  const { terms } = data;

  if (terms.length === 0) {
    return (
      <ChartCard
        title="Rata-rata Semester"
        description="Rata-rata nilai rapor kamu tiap semester."
      >
        <EmptyChartState
          height={220}
          title="Belum ada nilai rapor"
          message="Rata-rata semester muncul setelah guru menuntaskan nilai rapor kamu."
        />
      </ChartCard>
    );
  }

  const latest = terms[terms.length - 1];
  const prev = terms.length > 1 ? terms[terms.length - 2] : null;
  const delta =
    prev != null ? Math.round((latest.average - prev.average) * 10) / 10 : null;

  const rows = terms.map((t) => ({ ...t, term: `${t.semester} ${shortYear(t.year)}` }));

  return (
    <ChartCard
      title="Rata-rata Semester"
      description="Rata-rata nilai rapor kamu tiap semester."
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div className="grid gap-0.5">
            <span className="text-3xl font-semibold tabular-nums">
              {formatScore(latest.average)}
            </span>
            <span className="text-xs text-muted-foreground">
              {latest.label} · {latest.subjects} mapel
            </span>
          </div>
          <div className="grid justify-items-end gap-1.5">
            <GradeBadge score={latest.average} mode="band" />
            {delta !== null ? <DeltaPill delta={delta} /> : null}
          </div>
        </div>

        <ChartContainer config={config} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={rows} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="term"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={4}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as
                      | { label: string; subjects: number }
                      | undefined;
                    return p ? `${p.label} · ${p.subjects} mapel` : "";
                  }}
                />
              }
            />
            <Bar dataKey="average" radius={6}>
              {rows.map((r) => (
                <Cell key={r.yearId} fill={BAND_COLOR[gradeBand(r.average).predikat]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </ChartCard>
  );
}

// Signed change versus the previous term: up reads as progress, down as a warning.
function DeltaPill({ delta }: { delta: number }) {
  const Icon =
    delta > 0 ? TrendingUpIcon : delta < 0 ? TrendingDownIcon : MinusIcon;
  const tone =
    delta > 0
      ? "text-success"
      : delta < 0
        ? "text-destructive"
        : "text-muted-foreground";
  const text =
    delta === 0
      ? "Tetap dari semester lalu"
      : `${delta > 0 ? "+" : ""}${formatScore(delta)} dari semester lalu`;

  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", tone)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {text}
    </span>
  );
}
