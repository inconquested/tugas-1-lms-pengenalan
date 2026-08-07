import { KeyRoundIcon } from "lucide-react";
import { CopyButton } from "@/components/app/copy-button";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

/**
 * A labelled join code with one-click copy. The code reads in mono/tabular so the
 * characters stay unambiguous; copy feedback (icon morph + toast) lives in CopyButton.
 */
export function JoinCode({
  label,
  code,
  icon: Icon = KeyRoundIcon,
  className,
}: {
  label: string;
  code: string;
  icon?: IconType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2",
        className,
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="grid min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate font-mono text-sm font-semibold tracking-wide tabular-nums">
          {code}
        </span>
      </div>
      <CopyButton value={code} label={`Salin ${label.toLowerCase()}`} className="ml-auto" />
    </div>
  );
}
