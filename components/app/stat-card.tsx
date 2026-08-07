import type * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type IconType = React.ComponentType<{ className?: string }>;

// Single metric tile for dashboard overviews.
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: IconType;
  hint?: string;
}) {
  return (
    <Card className="animate-fade-in-up transition-[transform,box-shadow,--tw-ring-color] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        {Icon ? (
          <CardAction className="text-muted-foreground transition-colors group-hover/card:text-primary">
            <Icon className="size-5" />
          </CardAction>
        ) : null}
      </CardHeader>
      {hint ? (
        <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
      ) : null}
    </Card>
  );
}
