'use client';

import { Users, Calendar, Activity, Bell, Baby, Heart } from 'lucide-react';
import { StatCard } from './StatCard';
import { HealthMetricsChart } from './HealthMetricsChart';

interface AnalyticsData {
  totalPatients: number;
  newPatientsThisMonth: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  activeNotifications: number;
  maternalPatients: number;
  newbornPatients: number;
  highRiskCases: number;
  weeklyVisits: { label: string; value: number }[];
  appointmentsByType: { label: string; value: number }[];
  patientsByAge: { label: string; value: number }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={data.totalPatients}
          description="Active records"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, label: 'from last month' }}
          variant="primary"
        />
        <StatCard
          title="Today's Appointments"
          value={data.todayAppointments}
          description="Scheduled for today"
          icon={<Calendar className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Maternal Patients"
          value={data.maternalPatients}
          description="Prenatal care"
          icon={<Heart className="h-5 w-5" />}
          trend={{ value: 8, label: 'this month' }}
          variant="warning"
        />
        <StatCard
          title="Newborn Care"
          value={data.newbornPatients}
          description="Under 1 year"
          icon={<Baby className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="High Risk Cases"
          value={data.highRiskCases}
          description="Requiring attention"
          icon={<Activity className="h-5 w-5" />}
          variant="danger"
        />
        <StatCard
          title="Pending Appointments"
          value={data.pendingAppointments}
          description="Awaiting confirmation"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Active Notifications"
          value={data.activeNotifications}
          description="Unread alerts"
          icon={<Bell className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <HealthMetricsChart
          title="Weekly Patient Visits"
          description="Number of patient visits per day"
          data={data.weeklyVisits}
          type="line"
          height={200}
        />
        <HealthMetricsChart
          title="Appointments by Type"
          description="Distribution of appointment types"
          data={data.appointmentsByType}
          type="donut"
          height={200}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <HealthMetricsChart
          title="Appointment Status"
          description="Current month statistics"
          data={[
            { label: 'Completed', value: data.completedAppointments, color: '#22c55e' },
            { label: 'Scheduled', value: data.pendingAppointments, color: '#0ea5e9' },
            { label: 'Cancelled', value: data.cancelledAppointments, color: '#ef4444' },
          ]}
          type="bar"
          height={150}
        />
        <HealthMetricsChart
          title="Patients by Age Group"
          description="Age distribution of patients"
          data={data.patientsByAge}
          type="bar"
          height={150}
        />
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
