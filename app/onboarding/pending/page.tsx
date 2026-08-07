import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { HourglassIcon } from "lucide-react";
import { getCurrentUser, dashboardPath } from "@/lib/auth";
import { RefreshButton } from "@/components/app/refresh-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Menunggu Persetujuan" };

export default async function OnboardingPendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  // Left the pending state (approved -> GURU, or rejected -> back to student).
  if (user.teacherRequestStatus !== "PENDING") {
    if (!user.onboarded) redirect("/onboarding");
    redirect(dashboardPath(user.role));
  }

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-muted/30 p-6"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <HourglassIcon className="size-5" aria-hidden="true" />
          </span>
          <CardTitle>Menunggu persetujuan admin</CardTitle>
          <CardDescription>
            Pendaftaran Anda sebagai guru sedang ditinjau. Anda akan bisa masuk
            ke portal guru setelah admin menyetujui.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sudah disetujui? Perbarui halaman ini untuk melanjutkan.
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <RefreshButton>Periksa status</RefreshButton>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Keluar
            </button>
          </SignOutButton>
        </CardFooter>
      </Card>
    </main>
  );
}
