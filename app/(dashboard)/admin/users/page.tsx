import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getClerkAvatarMap } from "@/lib/clerk-avatars";
import { roleLabel } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { UserAvatar } from "@/components/app/user-avatar";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import {
  CreateUserButton,
  UserContactActions,
} from "@/components/app/forms/user-actions";

export const metadata: Metadata = { title: "Manajemen Pengguna" };

const VALID_ROLES: Role[] = ["ADMIN", "GURU", "SISWA"];

const ROLE_BADGE: Record<Role, "default" | "info" | "secondary"> = {
  ADMIN: "default",
  GURU: "info",
  SISWA: "secondary",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const activeRole =
    role && VALID_ROLES.includes(role as Role) ? (role as Role) : undefined;

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const avatars = await getClerkAvatarMap(users.map((u) => u.clerkId));

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const filters = [
    { value: "", label: "Semua", count: users.length },
    { value: "ADMIN", label: "Admin", count: counts.ADMIN ?? 0 },
    { value: "GURU", label: "Guru", count: counts.GURU ?? 0 },
    { value: "SISWA", label: "Siswa", count: counts.SISWA ?? 0 },
  ];

  const filtered = activeRole
    ? users.filter((u) => u.role === activeRole)
    : users;

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun admin, guru, dan siswa."
      >
        <CreateUserButton />
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive =
            (f.value === "" && !activeRole) || f.value === activeRole;
          return (
            <LinkButton
              key={f.value || "all"}
              href={f.value ? `/admin/users?role=${f.value}` : "/admin/users"}
              variant={isActive ? "default" : "outline"}
              size="sm"
            >
              {f.label}
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="tabular-nums"
              >
                {f.count}
              </Badge>
            </LinkButton>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Belum ada pengguna"
          description="Tambahkan pengguna baru atau ubah filter peran."
          action={<CreateUserButton />}
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {filtered.map((u) => {
            const pending = u.clerkId.startsWith("pending-");
            return (
              <li
                key={u.id}
                className="group/row flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4"
              >
                <UserAvatar
                  name={u.name}
                  src={avatars.get(u.clerkId)}
                  size="lg"
                />
                <div className="grid min-w-0 gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{u.name}</span>
                    <Badge variant={ROLE_BADGE[u.role]} className="shrink-0">
                      {roleLabel(u.role)}
                    </Badge>
                  </div>
                  <a
                    href={`mailto:${u.email}`}
                    className="truncate text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {u.email}
                  </a>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <Badge
                    variant={pending ? "warning" : "outline"}
                    className="hidden sm:inline-flex"
                  >
                    {pending ? "Menunggu" : "Tersinkron"}
                  </Badge>
                  <UserContactActions user={u} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
