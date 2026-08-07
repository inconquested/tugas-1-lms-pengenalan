"use client";

import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { UserAvatar } from "@/components/app/user-avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabel } from "@/lib/format";
import type { Role } from "@/app/generated/prisma/client";

export function NavUser({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  // Current user's real Clerk photo when uploaded; initials otherwise.
  const imageUrl = clerkUser?.hasImage ? clerkUser.imageUrl : undefined;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton size="lg">
            <UserAvatar name={user.name} src={imageUrl} size="sm" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {roleLabel(user.role)}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" aria-hidden="true" />
          </SidebarMenuButton>
          <DropdownMenu placement="top start" className="min-w-56">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Clears the Clerk session, then returns to the entry point. */}
            <DropdownMenuItem
              variant="destructive"
              onAction={() => signOut({ redirectUrl: "/sign-in" })}
            >
              <LogOutIcon aria-hidden="true" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
