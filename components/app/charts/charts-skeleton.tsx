import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

// Fallbacks shaped like the real chart grids so streamed content swaps in without shifting.

function ChartCardSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function AdminChartsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCardSkeleton />
        <div className="lg:col-span-2">
          <ChartCardSkeleton />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCardSkeleton />
        <div className="lg:col-span-2">
          <ChartCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function TeacherChartsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton height={240} />
      </div>
      <ChartCardSkeleton height={160} />
    </div>
  );
}

export function StudentChartsSkeleton() {
  return (
    <div className="grid gap-4">
      <ChartCardSkeleton height={280} />
      <ChartCardSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCardSkeleton height={240} />
        <ChartCardSkeleton height={240} />
      </div>
    </div>
  );
}
