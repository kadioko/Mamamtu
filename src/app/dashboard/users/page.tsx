import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserForm } from '@/components/dashboard/AdminUserForm';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can manage staff accounts.</div>;
  }

  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'] } },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Users</h1>
        <p className="text-muted-foreground">Create admin, provider, and receptionist accounts.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Create Staff Account</CardTitle></CardHeader>
        <CardContent><AdminUserForm /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Existing Staff</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="grid gap-2 border-b pb-3 text-sm last:border-0 md:grid-cols-4">
              <p className="font-medium">{user.name || 'Unnamed'}</p>
              <p>{user.email}</p>
              <p>{user.role.replace(/_/g, ' ')}</p>
              <p className={user.isActive ? 'text-green-700' : 'text-muted-foreground'}>{user.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
