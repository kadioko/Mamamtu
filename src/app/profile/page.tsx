import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, Mail, Settings, ShieldCheck, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth';
import type { UserRole } from '@/types/roles';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  HEALTHCARE_PROVIDER: 'Healthcare provider',
  PATIENT: 'Patient',
  RECEPTIONIST: 'Receptionist',
};

function formatDate(value?: Date | string | null) {
  if (!value) return 'Not verified';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const user = session.user;
  const displayName = user.name || user.email || 'MamaMtu user';
  const roleLabel = roleLabels[user.role] ?? user.role;

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">View your MamaMtu account details and access settings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Account settings
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCircle className="h-12 w-12" />
            </div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Badge>{roleLabel}</Badge>
              <Badge variant={user.isActive === false ? 'destructive' : 'secondary'}>
                {user.isActive === false ? 'Inactive' : 'Active'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Information from your current authenticated session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="break-words font-medium">{user.email || 'No email on file'}</p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Role
                </div>
                <p className="font-medium">{roleLabel}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Email verification
              </div>
              <p className="font-medium">{formatDate(user.emailVerified)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
