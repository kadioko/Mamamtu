'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AdminUserForm() {
  const [role, setRole] = useState('HEALTHCARE_PROVIDER');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  function generateTemporaryPassword() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const random = Array.from({ length: 10 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    setTemporaryPassword(`Mama${random}7`);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          role,
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create user');
      }
      toast.success('Staff account saved');
      event.currentTarget.reset();
      setTemporaryPassword('');
      setRole('HEALTHCARE_PROVIDER');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Invite staff by creating their account with a temporary password. They can sign in immediately, and admins can force a reset later from the staff list.
      </div>
      <div className="grid gap-4 md:grid-cols-5 md:items-end">
      <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary password</Label>
        <div className="flex gap-2">
          <Input id="password" name="password" type="text" minLength={8} value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} required />
          <Button type="button" variant="outline" onClick={generateTemporaryPassword}>Generate</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="HEALTHCARE_PROVIDER">Provider</SelectItem>
            <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Create Staff'}</Button>
      </div>
    </form>
  );
}
