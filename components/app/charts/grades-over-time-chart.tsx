"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import { RangeToggle } from "@/components/app/charts/range-toggle";
import { hasData } from "@/lib/analytics/guards";
import { filterByRange } from "@/lib/analytics/range";
import { formatDayLabel } from "@/lib/format";
import { type GradeTimeline, type TimeRange } from "@/lib/analytics/types";

const config = {
  grade: { label: "Nilai", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function GradesOverTimeChart({ data }: { data: GradeTimeline }) {
  const [range, setRange] = useState<TimeRange>("all");
  const filled = hasData(data);
  const points = useMemo(
    () => filterByRange(data.points, range),
    [data.points, range],
  );

  return (
    <ChartCard
      title="Perkembangan Nilai"
      description="Tren nilai tugas kamu dari waktu ke waktu."
      action={filled ? <RangeToggle value={range} onChange={setRange} /> : undefined}
    >
      {!filled ? (
        <EmptyChartState
          height={260}
          title="Belum ada nilai"
          message="Grafik perkembangan muncul setelah tugas kamu dinilai oleh guru."
        />
      ) : (
      <ChartContainer config={config} className="h-[260px] w-full">
        <LineChart accessibilityLayer data={points} margin={{ left: 4, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tickFormatter={formatDayLabel}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  const point = payload?.[0]?.payload as
                    | { title: string; subject: string }
                    | undefined;
                  return point
                    ? `${point.title} · ${point.subject}`
                    : formatDayLabel(String(value));
                }}
              />
            }
          />
          <Line
            dataKey="grade"
            type="monotone"
            stroke="var(--color-grade)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-grade)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
      )}
    </ChartCard>
  );
}
