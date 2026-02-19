'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  Baby,
  Bell,
  UserPlus,
  CalendarPlus,
  FileText,
  BookOpen,
  CalendarX,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export interface Appointment {
  id: string;
  type: string;
  patientName: string;
  date: string;
  time: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentResponse {
  id: string;
  type: {
    replace: (search: string, replace: string) => string;
  };
  patient: {
    firstName: string;
    lastName: string;
  } | null;
  startTime: string;
  status: string | null;
}

interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
  onClick: () => void;
}

interface DashboardData {
  metrics: {
    activePatients: number;
    upcomingAppointments: number;
    activePregnancies: number;
    alerts: number;
  };
  recentAppointments: Appointment[];
}

const MetricCard = ({ title, value, description, icon, isLoading = false }: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full" role="status" aria-live="polite" aria-busy="true">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" aria-hidden="true"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full" aria-hidden="true"></div>
        </CardHeader>
        <CardContent>
          <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded animate-pulse mb-2" aria-hidden="true"></div>
          <div className="h-3 w-24 sm:w-28 bg-gray-100 rounded" aria-hidden="true"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-5">
        <CardTitle 
          className="text-sm sm:text-base font-medium" 
          id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
        >
          {title}
        </CardTitle>
        <span aria-hidden="true" className="text-muted-foreground">
          {icon}
        </span>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-5">
        <div 
          className="text-xl sm:text-2xl font-bold mb-1" 
          aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
        >
          {value}
        </div>
        <p 
          className="text-xs sm:text-sm text-muted-foreground leading-tight" 
          id={`${title.toLowerCase().replace(/\s+/g, '-')}-desc`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const RecentAppointments = ({ appointments, isLoading }: { appointments: Appointment[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="p-3 sm:p-4 border rounded-lg animate-pulse" 
            aria-hidden="true"
          >
            <div className="flex justify-between">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-100 rounded mt-2"></div>
          </div>
        ))}
        <span className="sr-only">Loading appointments...</span>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-2 text-sm font-medium">No appointments</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by scheduling a new appointment.</p>
      </div>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'completed':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4" role="list" aria-label="Recent appointments">
      {appointments.map((appointment) => (
        <article 
          key={appointment.id} 
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            "p-3 sm:p-4 border rounded-lg transition-all duration-200",
            "hover:shadow-md hover:border-accent-foreground/20",
            "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary/50"
          )}
          role="listitem"
          aria-labelledby={`appointment-${appointment.id}-title`}
          tabIndex={0}
        >
          <div className="mb-2 sm:mb-0">
            <h3 
              className="font-medium text-sm sm:text-base" 
              id={`appointment-${appointment.id}-title`}
            >
              {appointment.patientName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <span className="font-medium">{appointment.type}</span> • {appointment.date} • {appointment.time}
            </p>
          </div>
          <span 
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              getStatusStyles(appointment.status || '')
            )}
          >
            {appointment.status || 'Scheduled'}
          </span>
        </article>
      ))}
    </div>
  );
};

const QuickActions = ({ actions, isLoading }: { actions: QuickAction[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3" role="status" aria-live="polite" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-24 sm:h-28 bg-gray-100 rounded-lg animate-pulse p-4" 
            aria-hidden="true"
          >
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        ))}
        <span className="sr-only">Loading quick actions...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3" role="menu" aria-label="Quick actions">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            "group relative flex flex-col items-center justify-center",
            "p-3 sm:p-4 rounded-lg border border-border bg-card",
            "hover:bg-accent hover:border-accent-foreground/20",
            "transition-all duration-200 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            "min-h-[96px] sm:min-h-[112px] w-full"
          )}
          role="menuitem"
          aria-label={action.ariaLabel || action.label}
        >
          {action.icon && (
            <span className="mb-2 p-2 rounded-full bg-accent/20 text-primary group-hover:bg-primary/20 transition-colors">
              {action.icon}
            </span>
          )}
          <span className="text-sm sm:text-base font-medium text-center">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch metrics from real API
        const metricsResponse = await fetch('/api/dashboard/metrics');
        const metrics = await metricsResponse.json();

        // Fetch recent appointments
        const appointmentsResponse = await fetch('/api/appointments?limit=5&status=SCHEDULED,CONFIRMED');
        const appointmentsData = await appointmentsResponse.json();

        const demoData: DashboardData = {
          metrics: {
            activePatients: metrics.activePatients.count,
            upcomingAppointments: metrics.upcomingAppointments.count,
            activePregnancies: metrics.activePregnancy.count,
            alerts: metrics.alerts.count,
          },
          recentAppointments: (appointmentsData.data || []).map((apt: AppointmentResponse) => ({
            id: apt.id,
            type: apt.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
            patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient' as string,
            date: new Date(apt.startTime).toLocaleDateString(),
            time: new Date(apt.startTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            status: apt.status === 'SCHEDULED' ? 'upcoming' : apt.status === 'COMPLETED' ? 'completed' : 'cancelled',
          })),
        };

        setDashboardData(demoData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Fallback to simulated data for demo
        const fallbackData: DashboardData = {
          metrics: {
            activePatients: 142,
            upcomingAppointments: 12,
            activePregnancies: 23,
            alerts: 5,
          },
          recentAppointments: [
            {
              id: '1',
              type: 'Prenatal Checkup',
              patientName: 'Fatima Al-Rashid',
              date: '2025-09-10',
              time: '10:00 AM',
              status: 'upcoming',
            },
            {
              id: '2',
              type: 'Routine Checkup',
              patientName: 'Sarah Mugo',
              date: '2025-09-09',
              time: '2:30 PM',
              status: 'completed',
            },
            {
              id: '3',
              type: 'Ultrasound',
              patientName: 'Amina Hassan',
              date: '2025-09-11',
              time: '11:15 AM',
              status: 'upcoming',
            },
          ],
        };
        setDashboardData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'add-patient',
      label: 'Add Patient',
      ariaLabel: 'Add a new patient to the system',
      icon: <UserPlus className="h-6 w-6" />,
      onClick: () => router.push('/dashboard/patients' as any),
    },
    {
      id: 'schedule-appointment',
      label: 'Schedule',
      ariaLabel: 'Schedule a new appointment',
      icon: <CalendarPlus className="h-6 w-6" />,
      onClick: () => router.push('/dashboard/appointments' as any),
    },
    {
      id: 'view-records',
      label: 'Records',
      ariaLabel: 'View and manage patient records',
      icon: <FileText className="h-6 w-6" />,
      onClick: () => router.push('/dashboard/records' as any),
    },
    {
      id: 'health-education',
      label: 'Education',
      ariaLabel: 'Access health education materials',
      icon: <BookOpen className="h-6 w-6" />,
      onClick: () => router.push('/dashboard/education' as any),
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-destructive">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-destructive/80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-md border border-destructive/30 px-2 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">MamaMtu Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Overview of your maternal health clinic
        </p>
      </div>
      
      {/* Metrics Grid - Single column on mobile, 2 columns on md, 4 columns on lg+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <MetricCard
          title="Active Patients"
          value={dashboardData?.metrics.activePatients ?? 0}
          description="+5 from last month"
          icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Upcoming Appointments"
          value={dashboardData?.metrics.upcomingAppointments ?? 0}
          description="2 today"
          icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Pregnancies"
          value={dashboardData?.metrics.activePregnancies ?? 0}
          description="3 in third trimester"
          icon={<Baby className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Alerts"
          value={dashboardData?.metrics.alerts ?? 0}
          description="Requires attention"
          icon={<Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid - Single column on mobile, 2 columns on md+ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6">
        {/* Recent Appointments - Full width on mobile, 2/3 on md+ */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentAppointments 
                appointments={dashboardData?.recentAppointments ?? []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Full width on mobile, 1/3 on md+ */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions 
                actions={quickActions} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
