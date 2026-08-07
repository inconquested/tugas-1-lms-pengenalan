import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata: Metadata = { title: "Masuk" };

export default function SignInPage() {
  return (
    <AuthShell
      title="Selamat datang kembali."
      subtitle="Masuk untuk melanjutkan pembelajaran, mengelola kelas, dan memantau perkembangan nilai."
      bullets={[
        "Kelas, tugas, dan rapor dalam satu tempat",
        "Pantau tenggat dan nilai secara real-time",
        "E-Rapor aman dengan penguncian oleh admin",
      ]}
    >
      <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/onboarding" />
    </AuthShell>
  );
}
