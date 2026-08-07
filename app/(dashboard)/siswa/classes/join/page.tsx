import type { Metadata } from "next";
import { enrollByCodeAction } from "@/lib/actions/classes";
import { PageHeader } from "@/components/app/page-header";
import { CodeJoinForm } from "@/components/app/forms/code-join-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Gabung Kelas" };

export default async function SiswaJoinClassPage() {
  return (
    <>
      <PageHeader
        title="Gabung Kelas"
        description="Masukkan kode kelas untuk mulai mengikuti pelajaran."
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Gabung Kelas</CardTitle>
          <CardDescription>
            Kode diberikan oleh guru atau admin kelas kamu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeJoinForm
            action={enrollByCodeAction}
            name="studentJoinCode"
            label="Kode kelas"
            description="Minta kode kelas kepada guru atau admin."
            placeholder="Contoh: ABCD2345"
            submitLabel="Gabung kelas"
          />
        </CardContent>
      </Card>
    </>
  );
}
