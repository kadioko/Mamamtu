import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getLatestFacilityAssignments, isSuperAdmin } from '@/lib/admin-scope';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserForm } from '@/components/dashboard/AdminUserForm';
import { StaffUserManager, type StaffUser } from '@/components/dashboard/StaffUserManager';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can manage staff accounts.</div>;
  }

  const [users, facilityAssignments] = await Promise.all([
    prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] } },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      lastLogin: true,
      accountLockedUntil: true,
      failedLoginAttempts: true,
      passwordResetExpires: true,
      createdAt: true,
    },
    }),
    getLatestFacilityAssignments(),
  ]);

  const superAdmin = isSuperAdmin(session);
  const currentAdminFacility = facilityAssignments.get(session.user.id)?.facilityName ?? null;
  const visibleUsers = superAdmin
    ? users
    : users.filter((user) => user.id === session.user.id || (
        currentAdminFacility && facilityAssignments.get(user.id)?.facilityName === currentAdminFacility
      ));

  const staffUsers: StaffUser[] = visibleUsers.map((user) => ({
    ...user,
    role: user.role as StaffUser['role'],
    emailVerified: user.emailVerified?.toISOString() ?? null,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    accountLockedUntil: user.accountLockedUntil?.toISOString() ?? null,
    passwordResetExpires: user.passwordResetExpires?.toISOString() ?? null,
    facilityName: facilityAssignments.get(user.id)?.facilityName ?? null,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Users</h1>
        <p className="text-muted-foreground">
          {superAdmin
            ? 'Create, edit, deactivate, assign, and reset access across all clinics.'
            : `Manage staff assigned to ${currentAdminFacility || 'your clinic once assigned by a super admin'}.`}
        </p>
      </div>
      {superAdmin ? (
        <Card>
          <CardHeader><CardTitle>Create Staff Account</CardTitle></CardHeader>
          <CardContent><AdminUserForm /></CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Manage Existing Staff</CardTitle></CardHeader>
        <CardContent>
          <StaffUserManager users={staffUsers} currentUserId={session.user.id} canEditRoles={superAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}
