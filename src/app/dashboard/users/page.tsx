import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserForm } from '@/components/dashboard/AdminUserForm';
import { StaffUserManager, type StaffUser } from '@/components/dashboard/StaffUserManager';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can manage staff accounts.</div>;
  }

  const users = await prisma.user.findMany({
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
      createdAt: true,
    },
  });
  const staffUsers: StaffUser[] = users.map((user) => ({
    ...user,
    role: user.role as StaffUser['role'],
    emailVerified: user.emailVerified?.toISOString() ?? null,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Users</h1>
        <p className="text-muted-foreground">Create, edit, deactivate, and reset access for admin, provider, and receptionist accounts.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Create Staff Account</CardTitle></CardHeader>
        <CardContent><AdminUserForm /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Manage Existing Staff</CardTitle></CardHeader>
        <CardContent>
          <StaffUserManager users={staffUsers} currentUserId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
