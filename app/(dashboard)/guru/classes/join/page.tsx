import type { Metadata } from "next";
import { ArrowLeftIcon } from "lucide-react";
import { claimSubjectAction, claimHomeroomAction } from "@/lib/actions/classes";
import { PageHeader } from "@/components/app/page-header";
import { CodeJoinForm } from "@/components/app/forms/code-join-form";
import { LinkButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Gabung Kelas" };

export default function GuruJoinPage() {
  return (
    <>
      <PageHeader
        title="Gabung Kelas"
        description="Masukkan kode dari admin untuk mengampu mata pelajaran atau menjadi wali kelas."
      >
        <LinkButton variant="outline" href="/guru/classes">
          <ArrowLeftIcon aria-hidden="true" />
          Kembali
        </LinkButton>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gabung Mata Pelajaran</CardTitle>
            <CardDescription>
              Ampu satu slot mata pelajaran pada sebuah kelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeJoinForm
              action={claimSubjectAction}
              name="teacherJoinCode"
              label="Kode mata pelajaran"
              placeholder="Contoh: ABCD2345"
              submitLabel="Gabung mapel"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadi Wali Kelas</CardTitle>
            <CardDescription>
              Klaim tanggung jawab sebagai wali dari sebuah kelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeJoinForm
              action={claimHomeroomAction}
              name="homeroomJoinCode"
              label="Kode wali kelas"
              submitLabel="Klaim wali kelas"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
