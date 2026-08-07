import type * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Consistent frame for every dashboard chart: title, optional description, an action slot
// (e.g. a range filter), and an optional badge (e.g. "Simulasi" for the load gauges).
// Server-safe (no hooks) so it can wrap both server- and client-rendered chart bodies.
export function ChartCard({
  title,
  description,
  badge,
  action,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action || badge ? (
          <CardAction className="flex items-center gap-2">
            {action}
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
