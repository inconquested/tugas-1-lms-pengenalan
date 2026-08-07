"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";
import type * as React from "react";

// Fires a bound Server Action (e.g. `setActiveAction.bind(null, id)`) with a
// pending state and a toast for the result. Use for one-shot toggles.
export function ActionButton({
  action,
  children,
  variant = "outline",
  size = "sm",
  className,
}: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      isDisabled={pending}
      onPress={() =>
        start(async () => {
          const res = await action();
          if (res.ok) toast.success(res.message ?? "Berhasil.");
          else toast.error(res.message ?? "Gagal.");
        })
      }
    >
      {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
