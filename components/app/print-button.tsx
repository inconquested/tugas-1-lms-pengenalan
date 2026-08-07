"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Opens the browser print dialog so the student can save the E-Rapor as PDF.
export function PrintButton({
  label = "Cetak / Simpan PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button variant="outline" className={className} onPress={() => window.print()}>
      <PrinterIcon aria-hidden="true" />
      {label}
    </Button>
  );
}
