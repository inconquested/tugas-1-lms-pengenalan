import Link from "next/link";
import { ArrowLeftIcon, CheckCircle2Icon, GraduationCapIcon } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Reveal } from "@/components/app/motion";
import { LinkButton } from "@/components/ui/button";

// Branded two-pane shell for the Clerk auth widgets: a brand/marketing panel on
// large screens, the form centered on the right. Keeps sign-in / sign-up on the
// same premium footing as the rest of the app instead of a chromeless widget.
export function AuthShell({
  title,
  subtitle,
  bullets,
  children,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(60%_55%_at_100%_0%,color-mix(in_oklab,var(--primary-foreground)_16%,transparent),transparent),radial-gradient(50%_50%_at_0%_100%,color-mix(in_oklab,var(--primary-foreground)_10%,transparent),transparent)]"
        />
        <Link
          href="/"
          className="relative flex w-fit items-center gap-2 font-[family-name:var(--font-serif)] text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <GraduationCapIcon className="size-5" aria-hidden="true" />
          </span>
          Portal Sekolah
        </Link>

        <Reveal className="relative grid max-w-sm gap-6">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            {subtitle}
          </p>
          <ul className="grid gap-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2Icon
                  className="mt-0.5 size-4 shrink-0 text-primary-foreground/90"
                  aria-hidden="true"
                />
                <span className="text-primary-foreground/90">{bullet}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="relative text-xs text-primary-foreground/60">
          LMS &amp; E-Rapor untuk admin, guru, dan siswa.
        </p>
      </aside>

      <main className="relative flex flex-col">
        <header className="flex items-center justify-between p-6">
          <LinkButton href="/" variant="ghost" size="sm">
            <ArrowLeftIcon aria-hidden="true" />
            Beranda
          </LinkButton>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="flex w-full max-w-md flex-col items-center">
            <Link
              href="/"
              className="mb-8 flex items-center gap-2 font-[family-name:var(--font-serif)] text-lg font-semibold lg:hidden"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCapIcon className="size-5" aria-hidden="true" />
              </span>
              Portal Sekolah
            </Link>
            <Reveal className="flex w-full flex-col items-center" y={12}>
              {children}
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
