import * as React from "react";
import { cn } from "@/lib/utils";

// Label-above / control / error-below field group (Task 4.6 form pattern).
// Wires the accessible name, description and error via id + aria-describedby so
// every input reports validity to assistive tech.
export function Field({
  label,
  htmlFor,
  error,
  description,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string[];
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const descId = description ? `${htmlFor}-desc` : undefined;
  const errId = error?.length ? `${htmlFor}-err` : undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {/* Consumers spread `fieldProps` onto their control to inherit these ids. */}
      <FieldControl id={htmlFor} describedBy={[descId, errId]} invalid={!!errId}>
        {children}
      </FieldControl>
      {error?.length ? (
        <p id={errId} role="alert" className="text-xs font-medium text-destructive">
          {error.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

// Injects id / aria-describedby / aria-invalid into the single control child.
function FieldControl({
  id,
  describedBy,
  invalid,
  children,
}: {
  id: string;
  describedBy: (string | undefined)[];
  invalid: boolean;
  children: React.ReactNode;
}) {
  const described = describedBy.filter(Boolean).join(" ") || undefined;
  if (!React.isValidElement(children)) return <>{children}</>;
  const child = children as React.ReactElement<Record<string, unknown>>;
  return React.cloneElement(child, {
    id: child.props.id ?? id,
    "aria-describedby": described,
    "aria-invalid": invalid || undefined,
  });
}
