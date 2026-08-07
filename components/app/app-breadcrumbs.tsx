"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Static path segment -> human label. Covers every non-dynamic segment in the sitemap.
const LABELS: Record<string, string> = {
  admin: "Panel Admin",
  guru: "Panel Guru",
  siswa: "Panel Siswa",
  users: "Pengguna",
  "teacher-requests": "Persetujuan Guru",
  subjects: "Mata Pelajaran",
  "academic-years": "Tahun Ajaran",
  classes: "Kelas",
  rapor: "Rapor",
  "rapor-components": "Nilai Rapor",
  homeroom: "Wali Kelas",
  join: "Gabung Kelas",
  assignments: "Tugas",
  submissions: "Pengumpulan",
  s: "Pengumpulan",
  create: "Buat",
  new: "Baru",
  edit: "Ubah",
};

// Dynamic segments (ids / slugs) have no readable value here, so we name them by
// their parent context instead of leaking a raw UUID into the trail.
const DETAIL_LABELS: Record<string, string> = {
  classes: "Detail Kelas",
  assignments: "Detail Tugas",
  users: "Detail Pengguna",
  subjects: "Detail Mapel",
  rapor: "Detail Rapor",
  homeroom: "Detail Kelas",
  s: "Detail Pengumpulan",
};

function labelFor(segment: string, parent: string | undefined): string {
  return LABELS[segment] ?? (parent ? DETAIL_LABELS[parent] : undefined) ?? "Detail";
}

// Trail derived from the URL: the sidebar owns "where you can go", this owns "where you are".
export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: labelFor(segment, segments[i - 1]),
  }));

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <BreadcrumbItem
              key={crumb.href}
              // Collapse the ancestry on small screens; only the current page stays.
              className={isLast ? undefined : "hidden md:inline-flex"}
            >
              {isLast ? (
                <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
