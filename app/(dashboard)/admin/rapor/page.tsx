import type { Metadata } from "next";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { getAcademicYears } from "@/lib/services/academic-year.service";
import { semesterLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "E-Rapor" };

export default async function AdminRaporPage() {
  const years = await getAcademicYears();

  return (
    <>
      <PageHeader
        title="E-Rapor"
        description="Pilih tahun ajaran untuk mengelola dan mengunci rapor siswa."
      />

      {years.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title="Belum ada tahun ajaran"
          description="Buat tahun ajaran terlebih dahulu untuk mengelola rapor."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {years.map((y) => (
            <Card key={y.id}>
              <CardHeader>
                <CardDescription>Tahun ajaran</CardDescription>
                <CardTitle className="text-lg">
                  <Link
                    href={`/admin/rapor/${y.id}`}
                    className="hover:underline"
                  >
                    {y.year} - Semester {semesterLabel(y.semester)}
                  </Link>
                </CardTitle>
                {y.isActive ? (
                  <CardAction>
                    <Badge>Aktif</Badge>
                  </CardAction>
                ) : null}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
