import type * as React from "react";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

// Composed empty state: icon, message, and an optional call to action.
// `compact` shrinks padding + icon so it can sit inside a Card or a nested
// section without dominating the layout (top-level empties stay full-size).
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: IconType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            compact ? "size-10" : "size-12",
          )}
        >
          <Icon className={compact ? "size-5" : "size-6"} />
        </div>
      ) : null}
      <div className="grid gap-1">
        <p className={cn("font-medium", compact && "text-sm")}>{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
