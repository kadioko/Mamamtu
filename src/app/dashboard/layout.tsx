import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <div
        id="dashboard-main"
        className="flex-1 transition-[margin] duration-300 ml-16 lg:ml-64"
      >
        <div className="container py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
