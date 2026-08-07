import type { Metadata } from "next";
import { UserCheckIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPendingTeacherRequests } from "@/lib/services/user.service";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { TableFrame } from "@/components/app/data-table";
import { TeacherRequestActions } from "@/components/app/forms/teacher-request-actions";

export const metadata: Metadata = { title: "Persetujuan Guru" };

export default async function TeacherRequestsPage() {
  await requireRole("ADMIN");
  const requests = await getPendingTeacherRequests();

  return (
    <>
      <PageHeader
        title="Persetujuan Guru"
        description="Tinjau pendaftaran guru baru. Menyetujui memberi akses portal guru; menolak mengembalikan akun menjadi siswa."
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={UserCheckIcon}
          title="Tidak ada permintaan"
          description="Pendaftaran guru yang menunggu tinjauan akan muncul di sini."
        />
      ) : (
        <TableFrame caption="Daftar pendaftaran guru yang menunggu persetujuan">
          <thead>
            <tr>
              <th scope="col">Nama</th>
              <th scope="col">Email</th>
              <th scope="col">Tanggal Daftar</th>
              <th scope="col" className="text-right">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((user) => (
              <tr key={user.id}>
                <th scope="row" className="font-medium">
                  {user.name}
                </th>
                <td className="text-muted-foreground">{user.email}</td>
                <td className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="text-right">
                  <TeacherRequestActions userId={user.id} name={user.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableFrame>
      )}
    </>
  );
}
