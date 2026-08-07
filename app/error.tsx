"use client";

import { useEffect } from "react";
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route-segment error boundary. Anything a Server Component or action throws
// past its own try/catch lands here instead of a white screen. The raw error is
// logged server-side (via Next) but never rendered — the user sees friendly,
// actionable copy and a retry that re-runs the segment.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="mx-auto grid max-w-sm gap-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="grid gap-1.5">
          <h1 className="font-[family-name:var(--font-serif)] text-xl font-semibold">
            Terjadi kesalahan
          </h1>
          <p className="text-sm text-muted-foreground">
            Maaf, terjadi kendala saat memuat halaman ini. Silakan coba lagi.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onPress={() => reset()}>
            <RefreshCwIcon aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
