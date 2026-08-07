"use client";

import { useActionState } from "react";
import { BookOpenIcon, GraduationCapIcon } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { idle } from "@/lib/actions/types";
import { SubmitButton } from "@/components/app/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingChooser() {
  const studentAction = completeOnboardingAction.bind(null, "SISWA");
  const teacherAction = completeOnboardingAction.bind(null, "GURU");
  const [, studentForm] = useActionState(studentAction, idle);
  const [, teacherForm] = useActionState(teacherAction, idle);

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCapIcon className="size-5" aria-hidden="true" />
          </span>
          <CardTitle>Saya Siswa</CardTitle>
          <CardDescription>
            Bergabung ke kelas dengan kode, kumpulkan tugas, dan lihat rapor.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Akses langsung aktif setelah dipilih.
        </CardContent>
        <CardFooter>
          <form action={studentForm} className="w-full">
            <SubmitButton className="w-full" pendingLabel="Memproses...">
              Lanjut sebagai siswa
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpenIcon className="size-5" aria-hidden="true" />
          </span>
          <CardTitle>Saya Guru</CardTitle>
          <CardDescription>
            Bina kelas, susun tugas, dan isi nilai rapor.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pendaftaran guru ditinjau admin terlebih dahulu.
        </CardContent>
        <CardFooter>
          <form action={teacherForm} className="w-full">
            <SubmitButton
              className="w-full"
              variant="outline"
              pendingLabel="Mengirim..."
            >
              Daftar sebagai guru
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
