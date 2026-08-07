"use client";

import { TIME_RANGES, type TimeRange } from "@/lib/analytics/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Compact segmented control for time-range filtering, built on the kit ToggleGroup
// (react-aria) for roving-focus keyboard nav and single-selection semantics.
export function RangeToggle({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}) {
  return (
    <ToggleGroup
      size="sm"
      aria-label="Rentang waktu"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const next = [...keys][0] as TimeRange | undefined;
        if (next) onChange(next);
      }}
      className="gap-0.5 rounded-lg bg-muted p-0.5"
    >
      {TIME_RANGES.map((range) => (
        <ToggleGroupItem
          key={range.key}
          id={range.key}
          className="px-2 text-xs text-muted-foreground data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm"
        >
          {range.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
