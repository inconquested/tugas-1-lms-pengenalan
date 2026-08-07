"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";
import { hasData } from "@/lib/analytics/guards";
import type { SubjectAverages } from "@/lib/analytics/types";

const config = {
  average: { label: "Rata-rata", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SubjectRadarChart({ data }: { data: SubjectAverages }) {
  return (
    <ChartCard
      title="Kekuatan per Mata Pelajaran"
      description="Perbandingan rata-rata nilai antar mata pelajaran."
    >
      {!hasData(data) ? (
        <EmptyChartState
          height={240}
          title="Belum ada nilai mapel"
          message="Radar mata pelajaran muncul setelah kamu memperoleh nilai dari beberapa mapel."
        />
      ) : (
      <ChartContainer config={config} className="mx-auto h-[240px] w-full">
        <RadarChart data={data.subjects}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            dataKey="average"
            stroke="var(--color-average)"
            fill="var(--color-average)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ChartContainer>
      )}
    </ChartCard>
  );
}
