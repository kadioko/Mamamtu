'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HospitalIntegrationConfig } from '@/lib/admin-scope';

interface HospitalIntegrationManagerProps {
  facilities: string[];
  integrations: HospitalIntegrationConfig[];
}

export function HospitalIntegrationManager({ facilities, integrations }: HospitalIntegrationManagerProps) {
  const router = useRouter();
  const [facilityName, setFacilityName] = useState(facilities[0] ?? '');
  const [integrationType, setIntegrationType] = useState<'FHIR' | 'HL7' | 'CSV' | 'API'>('FHIR');
  const [status, setStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'CONNECTED' | 'PAUSED'>('PLANNED');
  const [isSaving, setIsSaving] = useState(false);

  async function saveIntegration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          systemName: form.get('systemName'),
          integrationType,
          status,
          endpoint: form.get('endpoint'),
          notes: form.get('notes'),
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save integration');
      }

      toast.success('Hospital integration saved');
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save integration');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveIntegration} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 xl:items-end">
        <div className="space-y-2">
          <Label htmlFor="integration-facility">Clinic / hospital</Label>
          <select
            id="integration-facility"
            value={facilityName}
            onChange={(event) => setFacilityName(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {facilities.map((facility) => (
              <option key={facility} value={facility}>{facility}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="systemName">System name</Label>
          <Input id="systemName" name="systemName" placeholder="OpenMRS, DHIS2, custom EMR" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="integration-type">Type</Label>
          <select
            id="integration-type"
            value={integrationType}
            onChange={(event) => setIntegrationType(event.target.value as typeof integrationType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="FHIR">FHIR</option>
            <option value="HL7">HL7</option>
            <option value="CSV">CSV</option>
            <option value="API">API</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="integration-status">Status</Label>
          <select
            id="integration-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="CONNECTED">Connected</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endpoint">Endpoint</Label>
          <Input id="endpoint" name="endpoint" placeholder="Optional URL or host" />
        </div>
        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
        <div className="space-y-2 md:col-span-2 xl:col-span-6">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Mapping notes, auth method, data owner, next step" />
        </div>
      </form>

      <div className="space-y-2">
        {integrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No external hospital systems registered yet.</p>
        ) : integrations.map((integration) => (
          <div key={integration.id} className="grid gap-2 rounded-lg border p-3 text-sm md:grid-cols-[1fr_1fr_0.7fr_0.7fr]">
            <div>
              <p className="font-medium">{integration.facilityName}</p>
              <p className="text-muted-foreground">{integration.systemName}</p>
            </div>
            <div>
              <p>{integration.endpoint || 'Endpoint not set'}</p>
              <p className="text-muted-foreground">{integration.notes || 'No notes'}</p>
            </div>
            <p>{integration.integrationType}</p>
            <p>{integration.status.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
