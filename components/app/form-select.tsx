"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

// Label-above react-aria Select that submits its selected key under `name` in a
// plain <form>. Accessible name comes from the visible label via aria-labelledby.
export function FormSelect({
  name,
  label,
  options,
  defaultValue,
  placeholder = "Pilih...",
  required,
  error,
  description,
  className,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string[];
  description?: string;
  className?: string;
}) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const errId = error?.length ? `${id}-err` : undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      <span id={labelId} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </span>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <Select
        name={name}
        defaultSelectedKey={defaultValue}
        isRequired={required}
        aria-labelledby={labelId}
        className="w-full"
      >
        <SelectTrigger
          aria-labelledby={labelId}
          aria-describedby={errId}
          aria-invalid={errId ? true : undefined}
        >
          <SelectValue>
            {({ selectedText }) => selectedText || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} id={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errId ? (
        <p id={errId} role="alert" className="text-xs font-medium text-destructive">
          {error!.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
