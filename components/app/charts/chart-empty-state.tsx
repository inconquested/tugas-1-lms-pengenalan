import type * as React from "react";
import { InboxIcon } from "lucide-react";

type IconType = React.ComponentType<{ className?: string }>;

// Shown inside a ChartCard when a query returns no rows. Sized to the chart body it replaces
// (default 220px) so streaming a chart in or out never shifts the surrounding grid.
export function EmptyChartState({
  icon: Icon = InboxIcon,
  title = "Belum ada data",
  message,
  action,
  height = 220,
}: {
  icon?: IconType;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  height?: number;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 text-center"
      style={{ minHeight: height }}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {message ? (
        <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
      ) : null}
      {action}
    </div>
  );
}
