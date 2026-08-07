"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SchoolIcon,
  TicketIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/app/nav-user";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";

type IconType = React.ComponentType<{ className?: string }>;
// A leaf link, or a branch that expands into a submenu of leaf links.
type NavLink = { href: string; label: string; icon: IconType };
type NavBranch = { label: string; icon: IconType; children: NavLink[] };
type NavEntry = NavLink | NavBranch;
type NavGroup = { label?: string; items: NavEntry[] };

function isBranch(entry: NavEntry): entry is NavBranch {
  return "children" in entry;
}

const NAV: Record<Role, { home: string; brand: string; groups: NavGroup[] }> = {
  ADMIN: {
    home: "/admin",
    brand: "Panel Admin",
    groups: [
      {
        items: [
          { href: "/admin", label: "Dasbor", icon: LayoutDashboardIcon },
        ],
      },
      {
        label: "Manajemen",
        items: [
          {
            label: "Manajemen Pengguna",
            icon: UsersIcon,
            children: [
              { href: "/admin/users", label: "Semua Pengguna", icon: UsersIcon },
              {
                href: "/admin/teacher-requests",
                label: "Persetujuan Guru",
                icon: UserCheckIcon,
              },
            ],
          },
          {
            label: "Kurikulum & Kelas",
            icon: SchoolIcon,
            children: [
              { href: "/admin/subjects", label: "Mata Pelajaran", icon: BookOpenIcon },
              {
                href: "/admin/academic-years",
                label: "Tahun Ajaran",
                icon: CalendarDaysIcon,
              },
              { href: "/admin/classes", label: "Kelas", icon: SchoolIcon },
            ],
          },
          { href: "/admin/rapor", label: "E-Rapor", icon: FileTextIcon },
        ],
      },
    ],
  },
  GURU: {
    home: "/guru",
    brand: "Panel Guru",
    groups: [
      {
        items: [
          { href: "/guru", label: "Beranda", icon: LayoutDashboardIcon },
          {
            label: "Operasi Kelas",
            icon: SchoolIcon,
            children: [
              { href: "/guru/classes", label: "Kelas Saya", icon: SchoolIcon },
              { href: "/guru/classes/join", label: "Gabung Kelas", icon: TicketIcon },
            ],
          },
        ],
      },
    ],
  },
  SISWA: {
    home: "/siswa",
    brand: "Panel Siswa",
    groups: [
      {
        items: [
          { href: "/siswa", label: "Beranda", icon: LayoutDashboardIcon },
          { href: "/siswa/classes", label: "Kelas Saya", icon: SchoolIcon },
          { href: "/siswa/rapor", label: "Rapor", icon: FileTextIcon },
        ],
      },
      {
        label: "Aksi",
        items: [
          { href: "/siswa/classes/join", label: "Gabung Kelas", icon: TicketIcon },
        ],
      },
    ],
  },
};

// Highlight exactly one leaf: the deepest nav href the current path sits under. (A plain
// prefix test would light up both a parent and its child on nested routes.)
function computeActiveHref(groups: NavGroup[], pathname: string): string | null {
  const leaves = groups
    .flatMap((group) => group.items)
    .flatMap((entry) => (isBranch(entry) ? entry.children : [entry]));
  return (
    leaves
      .filter(
        (leaf) =>
          pathname === leaf.href || pathname.startsWith(`${leaf.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null
  );
}

// A branch whose submenu expands/collapses. Open state is derived: it follows the active
// route by default (`manualOpen === null`) so navigating into the branch expands it, and a
// click pins an explicit open/closed value — no effect, no cascading re-render.
function NavCollapsible({
  branch,
  activeHref,
}: {
  branch: NavBranch;
  activeHref: string | null;
}) {
  const containsActive = branch.children.some((c) => c.href === activeHref);
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? containsActive;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onPress={() => setManualOpen(!open)}
        isActive={!open && containsActive}
        aria-expanded={open}
        tooltip={branch.label}
      >
        <branch.icon aria-hidden="true" />
        <span>{branch.label}</span>
        <ChevronRightIcon
          aria-hidden="true"
          className={cn(
            "ml-auto size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden",
            open && "rotate-90",
          )}
        />
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub>
          {branch.children.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton
                href={child.href}
                isActive={child.href === activeHref}
              >
                <child.icon aria-hidden="true" />
                <span>{child.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  role,
  user,
}: {
  role: Role;
  user: { name: string; email: string; role: Role };
}) {
  const pathname = usePathname();
  const config = NAV[role];
  const activeHref = computeActiveHref(config.groups, pathname);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href={config.home} size="lg">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCapIcon className="size-5" aria-hidden="true" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-[family-name:var(--font-serif)] font-semibold">
                  Portal Sekolah
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {config.brand}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-1">
        {config.groups.map((group, gi) => (
          <SidebarGroup key={group.label ?? `group-${gi}`}>
            {group.label ? (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            ) : null}
            <SidebarMenu className="gap-1">
              {group.items.map((item) =>
                isBranch(item) ? (
                  <NavCollapsible
                    key={item.label}
                    branch={item}
                    activeHref={activeHref}
                  />
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      href={item.href}
                      isActive={item.href === activeHref}
                      tooltip={item.label}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
