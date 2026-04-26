'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function DeleteClinicalButton({
  endpoint,
  redirectTo,
  label = 'Delete',
}: {
  endpoint: string;
  redirectTo: string;
  label?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function remove() {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Delete failed');
      }
      toast.success('Deleted');
      router.push(redirectTo as any);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button type="button" variant="destructive" onClick={remove} disabled={isDeleting}>
      {isDeleting ? 'Deleting...' : label}
    </Button>
  );
}

export function ArchivePregnancyButton({
  endpoint,
  redirectTo,
}: {
  endpoint: string;
  redirectTo: string;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function archive() {
    setIsSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REFERRED', notes: 'Archived from dashboard.' }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Archive failed');
      }
      toast.success('Episode archived');
      router.push(redirectTo as any);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Archive failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={archive} disabled={isSaving}>
      {isSaving ? 'Archiving...' : 'Archive'}
    </Button>
  );
}
