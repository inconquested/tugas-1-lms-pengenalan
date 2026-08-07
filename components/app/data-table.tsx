import type * as React from "react";
import { cn } from "@/lib/utils";

// Native semantic table shell (Task 3.2): a required <caption> for the accessible
// name, styled <thead>/<tbody> via descendant selectors so pages write plain
// <thead><tr><th scope="col"> markup. Horizontally scrollable on small screens.
export function TableFrame({
  caption,
  children,
  className,
}: {
  caption: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-card",
        className,
      )}
    >
      <table className="w-full caption-bottom border-collapse text-sm [&_tbody_td]:px-3 [&_tbody_td]:py-2.5 [&_tbody_tr]:border-t [&_tbody_tr]:border-border [&_tbody_tr:hover]:bg-muted/40 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:align-middle [&_thead]:bg-muted/40 [&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:text-muted-foreground">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
