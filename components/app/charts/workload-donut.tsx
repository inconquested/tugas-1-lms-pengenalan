import { StatusDonut } from "@/components/app/charts/status-donut";
import type { WorkloadBreakdown } from "@/lib/analytics/types";

export function WorkloadDonut({ data }: { data: WorkloadBreakdown }) {
  const segments = [
    { key: "graded", label: "Sudah dinilai", value: data.graded, color: "var(--chart-5)" },
    {
      key: "submitted",
      label: "Menunggu nilai",
      value: data.submitted,
      color: "var(--chart-2)",
    },
    {
      key: "pending",
      label: "Belum dikerjakan",
      value: data.pending,
      color: "var(--chart-3)",
    },
  ];

  return (
    <StatusDonut
      title="Beban & Pengumpulan"
      description="Status seluruh tugas dari kelas yang kamu ikuti."
      emptyMessage="Beban tugas muncul setelah gurumu menerbitkan tugas di kelas."
      segments={segments}
      centerValue={data.total}
      centerLabel="Total tugas"
    />
  );
}
