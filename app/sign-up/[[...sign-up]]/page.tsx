import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata: Metadata = { title: "Daftar" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Mulai perjalanan belajarmu."
      subtitle="Buat akun untuk bergabung ke kelas, mengumpulkan tugas, dan mengakses rapor digital."
      bullets={[
        "Pendaftaran kelas cukup dengan kode",
        "Kumpulkan tugas dan terima umpan balik",
        "Akses rapor digital kapan saja",
      ]}
    >
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
    </AuthShell>
  );
}
