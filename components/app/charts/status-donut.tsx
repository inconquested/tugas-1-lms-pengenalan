"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/app/charts/chart-card";
import { EmptyChartState } from "@/components/app/charts/chart-empty-state";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

// Reusable doughnut with a value in the hole and a labelled legend. Shared by the teacher
// completion breakdown and the student workload breakdown. Renders a full empty state (no
// legend of zeros) when every segment is zero.
export function StatusDonut({
  title,
  description,
  emptyMessage,
  segments,
  centerValue,
  centerLabel,
}: {
  title: string;
  description?: string;
  emptyMessage?: string;
  segments: DonutSegment[];
  centerValue: number;
  centerLabel: string;
}) {
  const config = Object.fromEntries(
    segments.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) as ChartConfig;
  const hasValues = segments.some((s) => s.value > 0);

  if (!hasValues) {
    return (
      <ChartCard title={title} description={description}>
        <EmptyChartState height={220} message={emptyMessage} />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} description={description}>
      <ChartContainer config={config} className="mx-auto h-[220px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="key" hideLabel />}
            />
            <Pie
              data={segments}
              dataKey="value"
              nameKey="key"
              innerRadius={58}
              strokeWidth={4}
            >
              {segments.map((s) => (
                <Cell key={s.key} fill={s.color} stroke="var(--card)" />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    return (
                      <text x={cx} y={cy} textAnchor="middle">
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-2xl font-semibold"
                        >
                          {centerValue}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

      <ul className="mt-2 grid gap-1.5">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 text-muted-foreground">{s.label}</span>
            <span className="font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
