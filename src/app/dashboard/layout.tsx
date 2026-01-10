import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <div className="flex-1 ml-16 lg:ml-64 transition-all duration-300">
        <div className="container py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
