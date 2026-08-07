import type * as React from "react";

type IconType = React.ComponentType<{ className?: string }>;

// Section title block used at the top of every dashboard page. `children` holds
// the primary action(s) for the page; `icon` renders an optional leading glyph.
export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: IconType;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-5" />
            </span>
          ) : null}
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
