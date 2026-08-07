import { requireRole } from "@/lib/auth";
import { AppSidebar } from "@/components/app/app-sidebar";
import { DashboardHeader } from "@/components/app/dashboard-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");
  return (
    <>
      <AppSidebar role="ADMIN" user={user} />
      <SidebarInset id="main-content">
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
