import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
