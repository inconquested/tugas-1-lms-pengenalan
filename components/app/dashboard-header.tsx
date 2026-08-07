import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { AppBreadcrumbs } from "@/components/app/app-breadcrumbs";

// Sticky top bar for dashboard shells: sidebar toggle + location breadcrumbs + theme switch.
export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <AppBreadcrumbs />
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
