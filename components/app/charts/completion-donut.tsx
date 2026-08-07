import { StatusDonut } from "@/components/app/charts/status-donut";
import type { CompletionBreakdown } from "@/lib/analytics/types";

export function CompletionDonut({ data }: { data: CompletionBreakdown }) {
  const segments = [
    { key: "graded", label: "Dinilai", value: data.graded, color: "var(--chart-5)" },
    {
      key: "submitted",
      label: "Menunggu nilai",
      value: data.submitted,
      color: "var(--chart-2)",
    },
    {
      key: "pending",
      label: "Belum dikumpulkan",
      value: data.pending,
      color: "var(--chart-3)",
    },
  ];

  return (
    <StatusDonut
      title="Status Penyelesaian Tugas"
      description="Pengumpulan terhadap total yang diharapkan."
      emptyMessage="Status penyelesaian muncul setelah Anda membuat tugas untuk kelas."
      segments={segments}
      centerValue={data.expected}
      centerLabel="Diharapkan"
    />
  );
}
