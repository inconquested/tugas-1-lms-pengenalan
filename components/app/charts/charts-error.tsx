import { TriangleAlertIcon } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";

// Shown when a dashboard analytics Server Action returns an error instead of data, so a
// failed aggregation degrades to a clear message rather than crashing the whole route.
export function ChartsError({ message }: { message?: string | null }) {
  return (
    <EmptyState
      icon={TriangleAlertIcon}
      title="Gagal memuat analitik"
      description={
        message ?? "Terjadi kesalahan saat mengambil data. Coba muat ulang halaman."
      }
    />
  );
}
