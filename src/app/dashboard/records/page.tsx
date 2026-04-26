import Link from 'next/link';
import { FileText, Paperclip, Plus } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function getAttachmentCount(attachments: string | null) {
  if (!attachments) return 0;

  try {
    const parsed = JSON.parse(attachments) as unknown;
    return Array.isArray(parsed) ? parsed.length : 1;
  } catch {
    return 1;
  }
}

export default async function MedicalRecordsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to medical records.</div>;
  }

  const records = await prisma.medicalRecord.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          patientId: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Review recent clinical notes, diagnoses, treatments, and attachments.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/patients">
            <Plus className="mr-2 h-4 w-4" />
            Add From Patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No medical records yet. Open a patient profile to add the first clinical record.
            </CardContent>
          </Card>
        ) : (
          records.map((record) => {
            const attachmentCount = getAttachmentCount(record.attachments);

            return (
              <Card key={record.id} className="border-l-4 border-sky-500">
                <CardContent className="space-y-4 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <FileText className="h-4 w-4 text-sky-500" />
                        <h2 className="font-semibold">{record.title}</h2>
                        <Badge variant="secondary">{record.recordType.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.patient.firstName} {record.patient.lastName} ({record.patient.patientId}) ·{' '}
                        {record.createdAt.toLocaleDateString()}
                      </p>
                      {record.description && <p className="text-sm">{record.description}</p>}
                    </div>

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/patients/${record.patient.id}`}>Open Patient</Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">Provider</span>
                      <p>{record.healthcareProvider || record.recordedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Facility</span>
                      <p>{record.facility || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attachments</span>
                      <p className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        {attachmentCount}
                      </p>
                    </div>
                  </div>

                  {(record.diagnosis || record.treatment) && (
                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      {record.diagnosis && (
                        <div>
                          <span className="text-muted-foreground">Diagnosis</span>
                          <p>{record.diagnosis}</p>
                        </div>
                      )}
                      {record.treatment && (
                        <div>
                          <span className="text-muted-foreground">Treatment</span>
                          <p>{record.treatment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
