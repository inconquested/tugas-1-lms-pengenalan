"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { type TimeRange, type UserGrowthSeries } from "@/lib/analytics/types";

const config = {
  siswa: { label: "Siswa", color: "var(--chart-1)" },
  guru: { label: "Guru", color: "var(--chart-2)" },
  admin: { label: "Admin", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function UserGrowthChart({ series }: { series: UserGrowthSeries }) {
  const [range, setRange] = useState<TimeRange>("30d");
  const filled = hasData(series);
  const data = useMemo(
    () => filterByRange(series.points, range),
    [series.points, range],
  );

  return (
    <ChartCard
      title="Pertumbuhan Pengguna"
      description="Akumulasi pengguna terdaftar per peran."
      action={filled ? <RangeToggle value={range} onChange={setRange} /> : undefined}
    >
      {!filled ? (
        <EmptyChartState
          height={260}
          title="Belum ada pengguna"
          message="Tren pertumbuhan muncul setelah pengguna mendaftar ke platform."
        />
      ) : (
      <ChartContainer config={config} className="h-[260px] w-full">
        <AreaChart accessibilityLayer data={data} margin={{ left: 4, right: 8 }}>
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
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent labelFormatter={(v) => formatDayLabel(String(v))} />
            }
          />
          <Area
            dataKey="siswa"
            type="monotone"
            stackId="1"
            stroke="var(--color-siswa)"
            fill="var(--color-siswa)"
            fillOpacity={0.2}
          />
          <Area
            dataKey="guru"
            type="monotone"
            stackId="1"
            stroke="var(--color-guru)"
            fill="var(--color-guru)"
            fillOpacity={0.2}
          />
          <Area
            dataKey="admin"
            type="monotone"
            stackId="1"
            stroke="var(--color-admin)"
            fill="var(--color-admin)"
            fillOpacity={0.2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
      )}
    </ChartCard>
  );
}
