import type { Metadata } from "next";
import {
  ArrowRightIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Portal Sekolah menyatukan kelas, tugas, penilaian, dan E-Rapor untuk admin, guru, dan siswa dalam satu tempat.",
};

const roles = [
  {
    icon: ShieldCheckIcon,
    title: "Admin",
    body: "Kelola pengguna, mata pelajaran, tahun ajaran, kelas, dan kunci rapor.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Guru",
    body: "Bina kelas, susun tugas, koreksi pengumpulan, dan isi nilai rapor.",
  },
  {
    icon: GraduationCapIcon,
    title: "Siswa",
    body: "Gabung kelas dengan kode, kumpulkan tugas, dan lihat rapor.",
  },
];

const features = [
  {
    icon: UsersIcon,
    title: "Pendaftaran berbasis kode",
    body: "Siswa dan guru bergabung ke kelas memakai kode unik. Satu siswa satu kelas per tahun ajaran.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Alur tugas ke nilai",
    body: "Dari pembuatan tugas, pengumpulan berkas, koreksi, hingga nilai pengetahuan dan keterampilan.",
  },
  {
    icon: LockKeyholeIcon,
    title: "E-Rapor terkunci",
    body: "Wali kelas melengkapi absensi dan catatan, admin mengunci rapor agar nilai final aman.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-[family-name:var(--font-serif)] text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCapIcon className="size-5" aria-hidden="true" />
          </span>
          Portal Sekolah
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LinkButton href="/sign-in" variant="ghost" size="lg">
            Masuk
          </LinkButton>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="grid gap-6">
            <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              LMS &amp; E-Rapor Sekolah
            </span>
            <h1 className="font-[family-name:var(--font-serif)] text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              Satu portal untuk kelas, tugas, dan rapor.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Kelola pembelajaran dan penilaian dari pendaftaran kelas sampai
              rapor akhir, tanpa berpindah aplikasi.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href="/sign-in" size="lg">
                Masuk ke portal
                <ArrowRightIcon aria-hidden="true" />
              </LinkButton>
              <LinkButton href="/sign-up" variant="outline" size="lg">
                Buat akun
              </LinkButton>
            </div>
          </div>

          {/* Real role entry cards, not a mock UI */}
          <ul className="grid gap-3">
            {roles.map((role) => (
              <li
                key={role.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-foreground/5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <role.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="grid gap-1">
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-muted-foreground">{role.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="grid gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-medium">{feature.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>Portal Sekolah - LMS &amp; E-Rapor</span>
          <span>Dibangun untuk admin, guru, dan siswa.</span>
        </div>
      </footer>
    </div>
  );
}
