"use client"

import {
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
  type CheckboxProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, children, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      className={cn(
        "group/checkbox inline-flex items-center gap-2 text-sm font-medium outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {composeRenderProps(
        children,
        (children, { isSelected, isIndeterminate, isFocusVisible, isInvalid }) => (
          <>
            <span
              data-slot="checkbox-indicator"
              className={cn(
                "relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-transparent text-current transition-colors dark:bg-input/30 [&>svg]:size-3.5",
                (isSelected || isIndeterminate) &&
                  "border-primary bg-primary text-primary-foreground dark:bg-primary",
                isFocusVisible && "border-ring ring-3 ring-ring/50",
                isInvalid &&
                  "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40"
              )}
            >
              {(isSelected || isIndeterminate) && <CheckIcon />}
            </span>
            {children}
          </>
        )
      )}
    </CheckboxPrimitive>
  )
}

export { Checkbox }
