import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { GraduationCapIcon } from "lucide-react";
import { getCurrentUser, dashboardPath } from "@/lib/auth";
import { OnboardingChooser } from "@/components/app/onboarding-chooser";

export const metadata: Metadata = { title: "Pilih Peran" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.teacherRequestStatus === "PENDING") redirect("/onboarding/pending");
  if (user.onboarded) redirect(dashboardPath(user.role));

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-muted/30 p-6"
    >
      <div className="grid max-w-xl gap-2 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCapIcon className="size-5" aria-hidden="true" />
        </span>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold tracking-tight">
          Selamat datang, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih peran Anda untuk melanjutkan. Pilihan ini menentukan tampilan
          portal Anda.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <OnboardingChooser />
      </div>
      <p className="text-sm text-muted-foreground">
        Bukan Anda?{" "}
        <SignOutButton redirectUrl="/sign-in">
          <button
            type="button"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Keluar
          </button>
        </SignOutButton>
      </p>
    </main>
  );
}
