'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TypedConfirmDialog } from '@/components/ui/typed-confirm-dialog';
import { DatabaseZap } from 'lucide-react';

export function DemoDataManager() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function resetDemoData() {
    setIsResetting(true);

    try {
      const response = await fetch('/api/admin/demo/reset', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to reset demo data');
      }

      toast.success('Demo data reset completed');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setConfirmOpen(true)} disabled={isResetting}>
        <DatabaseZap className="mr-2 h-4 w-4" />
        {isResetting ? 'Resetting...' : 'Reset Demo Data'}
      </Button>
      <TypedConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reset demo data?"
        description="This reseeds the demo environment so deck metrics, clinical records, newborns, immunizations, and reports return to the expected demo story."
        confirmationText="RESET DEMO"
        confirmLabel="Reset Demo Data"
        onConfirm={resetDemoData}
      />
    </>
  );
}
