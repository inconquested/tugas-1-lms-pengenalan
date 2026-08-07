"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copies a join code (or any short string) to the clipboard with feedback.
export function CopyButton({
  value,
  label = "Salin kode",
  variant = "ghost",
  size = "icon-sm",
  className,
}: {
  value: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      aria-label={label}
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Kode disalin ke papan klip.");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Gagal menyalin kode.");
        }
      }}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
    </Button>
  );
}
