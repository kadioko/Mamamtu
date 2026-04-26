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
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

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
      setRole('HEALTHCARE_PROVIDER');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-5 md:items-end">
      <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
      <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} required /></div>
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
    </form>
  );
}
