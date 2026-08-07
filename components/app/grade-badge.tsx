import { Badge } from "@/components/ui/badge";
import { formatScore, gradeBand } from "@/lib/format";

// Predikat -> semantic badge tone. A/B read as "good" (green/indigo), C warns
// (amber), D flags "needs guidance" (red). An unscored rapor stays neutral.
const PREDIKAT_VARIANT = {
  A: "success",
  B: "info",
  C: "warning",
  D: "destructive",
} as const;

/**
 * Color-coded grade chip driven by gradeBand(). `mode` picks what it reads:
 *  - "score"    -> the numeric score (e.g. 88)          [default]
 *  - "predikat" -> the letter band (A/B/C/D)
 *  - "band"     -> letter + descriptor (e.g. "A · Sangat Baik")
 */
export function GradeBadge({
  score,
  mode = "score",
  className,
}: {
  score: number | null | undefined;
  mode?: "score" | "predikat" | "band";
  className?: string;
}) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className={className}>
        Belum dinilai
      </Badge>
    );
  }

  const band = gradeBand(score);
  const label =
    mode === "predikat"
      ? band.predikat
      : mode === "band"
        ? `${band.predikat} · ${band.label}`
        : formatScore(score);

  return (
    <Badge variant={PREDIKAT_VARIANT[band.predikat]} className={className}>
      {label}
    </Badge>
  );
}
