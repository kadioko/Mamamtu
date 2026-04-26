import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    return <div className="p-6 text-muted-foreground">Sign in to view notifications.</div>;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    take: 50,
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      patient: { select: { firstName: true, lastName: true, patientId: true } },
      appointment: { select: { title: true, startTime: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Care reminders, follow-up alerts, and system messages for your account.</p>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">
              No notifications yet. Demo notifications are created for seeded staff accounts.
            </CardContent>
          </Card>
        ) : notifications.map((notification) => (
          <Card key={notification.id} className={notification.status === 'READ' ? 'opacity-75' : ''}>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_160px_120px] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{notification.title}</h2>
                  {notification.priority >= 7 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      High priority
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                {notification.patient && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Patient: {notification.patient.firstName} {notification.patient.lastName} ({notification.patient.patientId})
                  </p>
                )}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Type</span>
                <p>{notification.type.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status</span>
                <p>{notification.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
