"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Re-runs the server component so a just-approved teacher is routed onward.
export function RefreshButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      isDisabled={pending}
      onPress={() => start(() => router.refresh())}
    >
      <RefreshCwIcon
        className={pending ? "animate-spin" : undefined}
        aria-hidden="true"
      />
      {children}
    </Button>
  );
}
