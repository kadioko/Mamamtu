'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type StaffOption = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  facilityName?: string | null;
};

interface FacilityAssignmentManagerProps {
  staff: StaffOption[];
  facilities: string[];
}

export function FacilityAssignmentManager({ staff, facilities }: FacilityAssignmentManagerProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState(staff[0]?.id ?? '');
  const [selectedFacility, setSelectedFacility] = useState(facilities[0] ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function saveAssignment() {
    if (!selectedUserId || !selectedFacility) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/facility-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          facilityName: selectedFacility,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save assignment');
      }

      toast.success('Clinic assignment saved');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save assignment');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="staff-assignment-user">Staff member</Label>
          <select
            id="staff-assignment-user"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {staff.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || 'Unnamed'} - {user.role.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="staff-assignment-facility">Clinic / hospital</Label>
          <select
            id="staff-assignment-facility"
            value={selectedFacility}
            onChange={(event) => setSelectedFacility(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {facilities.map((facility) => (
              <option key={facility} value={facility}>{facility}</option>
            ))}
          </select>
        </div>
        <Button onClick={saveAssignment} disabled={isSaving || !selectedUserId || !selectedFacility}>
          {isSaving ? 'Saving...' : 'Assign'}
        </Button>
      </div>

      <div className="space-y-2">
        {staff.map((user) => (
          <div key={user.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{user.name || user.email || 'Unnamed'}</p>
              <p className="text-muted-foreground">{user.email} / {user.role.replace(/_/g, ' ')}</p>
            </div>
            <span className="text-muted-foreground">{user.facilityName || 'No clinic assigned'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
