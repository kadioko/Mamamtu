import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getProductionHealthReport } from '@/lib/productionHealth';
import {
  getFacilityNames,
  getHospitalIntegrations,
  getLatestFacilityAssignments,
  isSuperAdmin,
} from '@/lib/admin-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoDataManager } from '@/components/dashboard/DemoDataManager';
import { FacilityAssignmentManager } from '@/components/dashboard/FacilityAssignmentManager';
import { HospitalIntegrationManager } from '@/components/dashboard/HospitalIntegrationManager';
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarClock,
  Database,
  Download,
  FileSearch,
  HeartPulse,
  Hospital,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatDate(value: Date | null | undefined) {
  if (!value) return 'Never';
  return value.toLocaleString();
}

export default async function AdminControlCenterPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can view the control center.</div>;
  }
  const superAdmin = isSuperAdmin(session);

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const [
    staffTotal,
    activeStaff,
    lockedStaff,
    pendingResetStaff,
    activePatients,
    missingPhonePatients,
    activePregnancies,
    highRiskPregnancies,
    pregnanciesWithoutAnc,
    overdueAppointments,
    upcomingAppointments,
    newbornRecords,
    newbornsWithoutImmunizations,
    dueImmunizations,
    exportCount,
    lastExport,
    lastDemoSeed,
    medicalRecordsLastWeek,
    ancVisitsLastWeek,
    overdueImmunizations,
    medicalRecordFacilities,
    newbornFacilities,
    immunizationFacilities,
    staffUsers,
    facilityNames,
    facilityAssignments,
    hospitalIntegrations,
    healthReport,
    recentAuditEvents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] } } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] }, isActive: true } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] }, accountLockedUntil: { gt: now } } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] }, passwordResetExpires: { gt: now } } }),
    prisma.patient.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { isActive: true, OR: [{ phone: null }, { phone: '' }] } }),
    prisma.pregnancyEpisode.count({ where: { status: 'ACTIVE' } }),
    prisma.pregnancyEpisode.count({ where: { status: 'ACTIVE', riskLevel: { gte: 2 } } }),
    prisma.pregnancyEpisode.count({ where: { status: 'ACTIVE', antenatalVisits: { none: {} } } }),
    prisma.appointment.count({ where: { startTime: { lt: today }, status: { in: ['SCHEDULED', 'CONFIRMED'] } } }),
    prisma.appointment.count({ where: { startTime: { gte: today }, status: { in: ['SCHEDULED', 'CONFIRMED'] } } }),
    prisma.newbornRecord.count(),
    prisma.newbornRecord.count({ where: { immunizations: { none: {} } } }),
    prisma.immunization.count({ where: { nextDueAt: { gte: today, lte: nextMonth } } }),
    prisma.auditLog.count({ where: { resource: 'Export' } }),
    prisma.auditLog.findFirst({
      where: { resource: 'Export' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    }),
    prisma.auditLog.findFirst({
      where: { resource: 'DemoData' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.medicalRecord.count({ where: { createdAt: { gte: lastWeek } } }),
    prisma.antenatalVisit.count({ where: { createdAt: { gte: lastWeek } } }),
    prisma.immunization.count({ where: { nextDueAt: { lt: today } } }),
    prisma.medicalRecord.findMany({
      where: { facility: { not: null } },
      take: 100,
      select: { facility: true },
    }),
    prisma.newbornRecord.findMany({
      where: { deliveryFacility: { not: null } },
      take: 100,
      select: { deliveryFacility: true },
    }),
    prisma.immunization.findMany({
      where: { facility: { not: null } },
      take: 100,
      select: { facility: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] } },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, email: true, role: true },
    }),
    getFacilityNames(),
    getLatestFacilityAssignments(),
    getHospitalIntegrations(),
    getProductionHealthReport(),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    }),
  ]);

  const staffInactive = staffTotal - activeStaff;
  const ancLinkedPregnancies = activePregnancies - pregnanciesWithoutAnc;
  const ancCompletionRate = activePregnancies > 0 ? Math.round((ancLinkedPregnancies / activePregnancies) * 100) : 0;
  const followUpAdherenceRate = upcomingAppointments + overdueAppointments > 0
    ? Math.round((upcomingAppointments / (upcomingAppointments + overdueAppointments)) * 100)
    : 100;
  const facilityCounts = new Map<string, number>();
  for (const record of medicalRecordFacilities) {
    if (record.facility) facilityCounts.set(record.facility, (facilityCounts.get(record.facility) ?? 0) + 1);
  }
  for (const record of newbornFacilities) {
    if (record.deliveryFacility) facilityCounts.set(record.deliveryFacility, (facilityCounts.get(record.deliveryFacility) ?? 0) + 1);
  }
  for (const record of immunizationFacilities) {
    if (record.facility) facilityCounts.set(record.facility, (facilityCounts.get(record.facility) ?? 0) + 1);
  }
  const facilities = [...facilityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const staffWithAssignments = staffUsers.map((user) => ({
    ...user,
    role: user.role.replace(/_/g, ' '),
    facilityName: facilityAssignments.get(user.id)?.facilityName ?? null,
  }));
  const currentAdminFacility = session.user.id ? facilityAssignments.get(session.user.id)?.facilityName : null;
  const dataQualityItems = [
    { label: 'Missing patient phone numbers', value: missingPhonePatients, href: '/dashboard/patients' },
    { label: 'Active pregnancies without ANC visits', value: pregnanciesWithoutAnc, href: '/dashboard/pregnancies?status=ACTIVE' },
    { label: 'Overdue scheduled appointments', value: overdueAppointments, href: '/dashboard/appointments' },
    { label: 'Newborns without immunizations', value: newbornsWithoutImmunizations, href: '/dashboard/newborns' },
    { label: 'Overdue immunizations', value: overdueImmunizations, href: '/dashboard/immunizations' },
  ];
  const rolePermissions = [
    { role: 'Admin', staff: 'Full', patients: 'Full', clinical: 'Full', reports: 'Export', audit: 'Full' },
    { role: 'Provider', staff: '-', patients: 'Edit', clinical: 'Edit', reports: 'View', audit: '-' },
    { role: 'Receptionist', staff: '-', patients: 'Register', clinical: '-', reports: '-', audit: '-' },
  ];
  const adminReports = [
    { label: 'Staff activity events', value: recentAuditEvents.length, detail: 'latest audit events', href: '/dashboard/audit' },
    { label: 'Records created this week', value: medicalRecordsLastWeek, detail: 'medical records', href: '/dashboard/records' },
    { label: 'ANC completion', value: `${ancCompletionRate}%`, detail: `${ancLinkedPregnancies}/${activePregnancies} active pregnancies have ANC`, href: '/dashboard/antenatal' },
    { label: 'Follow-up adherence', value: `${followUpAdherenceRate}%`, detail: `${overdueAppointments} overdue scheduled visits`, href: '/dashboard/appointments' },
    { label: 'Immunization overdue', value: overdueImmunizations, detail: 'past due next-dose dates', href: '/dashboard/immunizations' },
  ];
  const deckMetrics = [
    { label: 'Active patients', value: 49 },
    { label: 'Active pregnancies', value: 22 },
    { label: 'High-risk pregnancies', value: 7 },
    { label: 'Upcoming appointments', value: 31 },
    { label: 'Newborn records', value: 12 },
    { label: 'Immunizations due soon', value: 20 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">Admin Control Center</h1>
            <Badge variant={superAdmin ? 'default' : 'secondary'}>{superAdmin ? 'Super admin' : 'Clinic admin'}</Badge>
          </div>
          <p className="text-muted-foreground">
            {superAdmin
              ? 'System-wide oversight for all admins, clinics, integrations, demo data, and clinical operations.'
              : `Clinic-level oversight${currentAdminFacility ? ` for ${currentAdminFacility}` : ''}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/dashboard/users"><UserCog className="mr-2 h-4 w-4" />Staff Users</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/audit"><FileSearch className="mr-2 h-4 w-4" />Audit Log</Link></Button>
          <Button asChild><Link href="/dashboard/reports"><Activity className="mr-2 h-4 w-4" />Reports</Link></Button>
          <DemoDataManager />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 text-blue-500" /> Staff Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeStaff}</p>
            <p className="mt-1 text-sm text-muted-foreground">{staffInactive} inactive, {lockedStaff} locked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-teal-500" /> Access Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingResetStaff}</p>
            <p className="mt-1 text-sm text-muted-foreground">pending password resets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarClock className="h-4 w-4 text-amber-500" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingAppointments}</p>
            <p className="mt-1 text-sm text-muted-foreground">{overdueAppointments} overdue scheduled visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Download className="h-4 w-4 text-purple-500" /> Clinical Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{exportCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">last: {formatDate(lastExport?.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Demo Data Manager</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset the demo database to the deck source-of-truth numbers before a live walkthrough.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {deckMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">Last reset: {formatDate(lastDemoSeed?.createdAt)}</p>
              <DemoDataManager />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rolePermissions.map((role) => (
              <div key={role.role} className="grid gap-2 rounded-lg border p-3 text-sm md:grid-cols-[0.8fr_repeat(5,1fr)]">
                <p className="font-medium">{role.role}</p>
                <p><span className="text-muted-foreground">Staff</span><br />{role.staff}</p>
                <p><span className="text-muted-foreground">Patients</span><br />{role.patients}</p>
                <p><span className="text-muted-foreground">Clinical</span><br />{role.clinical}</p>
                <p><span className="text-muted-foreground">Reports</span><br />{role.reports}</p>
                <p><span className="text-muted-foreground">Audit</span><br />{role.audit}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{superAdmin ? 'Clinic Admin Assignments' : 'Clinic Admin Scope'}</CardTitle>
          </CardHeader>
          <CardContent>
            {superAdmin ? (
              <FacilityAssignmentManager staff={staffWithAssignments} facilities={facilityNames} />
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">Your admin view is associated with one clinic or hospital. Super admins manage assignment changes.</p>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Assigned clinic / hospital</p>
                  <p className="text-lg font-semibold">{currentAdminFacility || 'Not assigned yet'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital System Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            {superAdmin ? (
              <HospitalIntegrationManager facilities={facilityNames} integrations={hospitalIntegrations} />
            ) : (
              <div className="space-y-3">
                {hospitalIntegrations.filter((integration) => !currentAdminFacility || integration.facilityName === currentAdminFacility).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No integrations registered for this clinic yet.</p>
                ) : hospitalIntegrations
                    .filter((integration) => !currentAdminFacility || integration.facilityName === currentAdminFacility)
                    .map((integration) => (
                      <div key={integration.id} className="rounded-lg border p-3 text-sm">
                        <p className="font-medium">{integration.systemName}</p>
                        <p className="text-muted-foreground">{integration.integrationType} / {integration.status.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operational Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Active Patients', value: activePatients, icon: Users, href: '/dashboard/patients' },
              { label: 'Active Pregnancies', value: activePregnancies, icon: Activity, href: '/dashboard/pregnancies?status=ACTIVE' },
              { label: 'High-Risk Pregnancies', value: highRiskPregnancies, icon: AlertTriangle, href: '/dashboard/pregnancies?risk=high' },
              { label: 'Newborn Records', value: newbornRecords, icon: Baby, href: '/dashboard/newborns' },
              { label: 'Immunizations Due Soon', value: dueImmunizations, icon: Database, href: '/dashboard/immunizations?due=soon' },
            ].map((item) => (
              <Link key={item.label} href={item.href as any} className="rounded-lg border p-4 transition-colors hover:bg-muted/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold">{item.value}</p>
                  </div>
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Quality Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataQualityItems.map((item) => (
              <Link key={item.label} href={item.href as any} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <span className="text-sm">{item.label}</span>
                <Badge variant={item.value > 0 ? 'destructive' : 'secondary'}>{item.value}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hospital className="h-5 w-5" />Clinic & Facility Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {facilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No facilities have been recorded yet.</p>
            ) : facilities.map(([facility, count]) => (
              <div key={facility} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{facility}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" />System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Overall status</span>
              <Badge variant={healthReport.status === 'ok' ? 'secondary' : 'destructive'}>{healthReport.status.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Database status</span>
              <Badge variant={healthReport.checks[0]?.status === 'ready' ? 'secondary' : 'destructive'}>{healthReport.checks[0]?.status ?? 'unknown'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Checked {new Date(healthReport.generatedAt).toLocaleString()}</p>
            <Button asChild variant="outline" size="sm"><Link href="/dashboard/production">Open Production Health</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" />Admin Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminReports.map((report) => (
              <Link key={report.label} href={report.href as any} className="block rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{report.label}</p>
                    <p className="text-xs text-muted-foreground">{report.detail}</p>
                  </div>
                  <span className="text-lg font-semibold">{report.value}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Recent Audit Activity</CardTitle>
          <Button asChild variant="outline" size="sm"><Link href="/dashboard/audit">Open Audit Log</Link></Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAuditEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events have been recorded yet.</p>
          ) : recentAuditEvents.map((event) => (
            <div key={event.id} className="grid gap-2 border-b pb-3 text-sm last:border-0 last:pb-0 md:grid-cols-[1fr_1fr_1fr_1.3fr]">
              <div><span className="text-muted-foreground">When</span><p>{event.createdAt.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Actor</span><p className="truncate">{event.user?.email ?? 'System'}</p></div>
              <div><span className="text-muted-foreground">Action</span><p>{event.action.replace(/_/g, ' ')}</p></div>
              <div><span className="text-muted-foreground">Resource</span><p className="truncate">{event.resource}{event.resourceId ? ` / ${event.resourceId}` : ''}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
