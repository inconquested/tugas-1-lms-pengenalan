import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { ChartCard } from "@/components/app/charts/chart-card";
import type { SystemLoadMetric } from "@/lib/analytics/types";

// Resource gauges. There is no real telemetry source in this app, so these are simulated
// and badged accordingly; accessible ProgressBars double as the "gauge" indicator.
export function SystemLoadPanel({ metrics }: { metrics: SystemLoadMetric[] }) {
  return (
    <ChartCard
      title="Beban & Penyimpanan Sistem"
      description="Pemantauan sumber daya platform."
      badge="Simulasi"
    >
      <div className="grid gap-5 py-2">
        {metrics.map((m) => (
          <div key={m.key} className="grid gap-1.5">
            <Progress value={m.value} aria-label={m.label}>
              <ProgressLabel>{m.label}</ProgressLabel>
              <ProgressValue />
            </Progress>
            <p className="text-xs text-muted-foreground">{m.detail}</p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
