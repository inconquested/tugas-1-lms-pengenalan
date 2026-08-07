import { SidebarProvider } from "@/components/ui/sidebar";

// Shared dashboard shell. Role layouts nest their sidebar + inset inside this
// provider so the collapse state and Ctrl/Cmd-B shortcut work across portals.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
