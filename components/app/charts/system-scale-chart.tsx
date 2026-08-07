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
import type { SystemScaleDatum } from "@/lib/analytics/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
];

const config = {
  value: { label: "Jumlah" },
} satisfies ChartConfig;

export function SystemScaleChart({ data }: { data: SystemScaleDatum[] }) {
  return (
    <ChartCard
      title="Skala & Kapasitas Sistem"
      description="Total entitas utama di seluruh platform."
    >
      {!hasData(data) ? (
        <EmptyChartState
          height={280}
          title="Belum ada data sistem"
          message="Tambahkan pengguna, mata pelajaran, dan kelas untuk melihat skala platform."
        />
      ) : (
      <ChartContainer config={config} className="h-[280px] w-full">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 24 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={92}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={6}>
            {data.map((d, i) => (
              <Cell key={d.key} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      )}
    </ChartCard>
  );
}
