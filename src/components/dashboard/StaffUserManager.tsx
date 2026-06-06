'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Edit, KeyRound, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type StaffRole = 'ADMIN' | 'HEALTHCARE_PROVIDER' | 'RECEPTIONIST';

export interface StaffUser {
  id: string;
  name: string | null;
  email: string | null;
  role: StaffRole;
  isActive: boolean;
  emailVerified: Date | string | null;
  lastLogin: Date | string | null;
  createdAt: Date | string;
}

interface StaffUserManagerProps {
  users: StaffUser[];
  currentUserId: string;
}

const roleLabels: Record<StaffRole, string> = {
  ADMIN: 'Admin',
  HEALTHCARE_PROVIDER: 'Provider',
  RECEPTIONIST: 'Receptionist',
};

function formatDate(value: Date | string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString();
}

export function StaffUserManager({ users, currentUserId }: StaffUserManagerProps) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<StaffUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const admins = users.filter((user) => user.role === 'ADMIN' && user.isActive).length;
    const providers = users.filter((user) => user.role === 'HEALTHCARE_PROVIDER' && user.isActive).length;
    const receptionists = users.filter((user) => user.role === 'RECEPTIONIST' && user.isActive).length;

    return { active, inactive: users.length - active, admins, providers, receptionists };
  }, [users]);

  async function updateStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;

    const form = new FormData(event.currentTarget);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          role: form.get('role'),
          isActive: form.get('isActive') === 'on',
          password: form.get('password') || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update staff account');
      }

      toast.success('Staff account updated');
      setEditingUser(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update staff account');
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivateStaff() {
    if (!deactivatingUser) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${deactivatingUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to deactivate staff account');
      }

      toast.success('Staff account deactivated');
      setDeactivatingUser(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate staff account');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Active staff</p>
          <p className="text-2xl font-semibold">{stats.active}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Admins</p>
          <p className="text-2xl font-semibold">{stats.admins}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Providers</p>
          <p className="text-2xl font-semibold">{stats.providers}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Receptionists</p>
          <p className="text-2xl font-semibold">{stats.receptionists}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Inactive</p>
          <p className="text-2xl font-semibold">{stats.inactive}</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;

          return (
            <div
              key={user.id}
              className="grid gap-3 rounded-lg border p-4 text-sm lg:grid-cols-[1.3fr_1.2fr_0.9fr_0.8fr_1fr]"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name || 'Unnamed'}</p>
                  {isSelf && <Badge variant="secondary">You</Badge>}
                  {user.role === 'ADMIN' && (
                    <ShieldCheck className="h-4 w-4 text-primary" aria-label="Admin" />
                  )}
                </div>
                <p className="break-all text-muted-foreground">{user.email}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Role</span>
                <p>{roleLabels[user.role]}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Status</span>
                <p className={user.isActive ? 'text-green-700' : 'text-muted-foreground'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Last login</span>
                <p>{formatDate(user.lastLogin)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isSelf || !user.isActive || isDeleting}
                  onClick={() => setDeactivatingUser(user)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
            <DialogDescription>
              Update account details, access level, status, or set a new password.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={updateStaff} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" name="name" defaultValue={editingUser.name || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingUser.email || ''} required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue={editingUser.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HEALTHCARE_PROVIDER">Provider</SelectItem>
                      <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New password</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="edit-password" name="password" type="password" minLength={8} className="pl-9" placeholder="Leave unchanged" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-active">Account active</Label>
                  <p className="text-xs text-muted-foreground">Inactive staff cannot sign in.</p>
                </div>
                <Switch id="edit-active" name="isActive" defaultChecked={editingUser.isActive} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivatingUser}
        onOpenChange={(open) => !open && setDeactivatingUser(null)}
        title="Deactivate staff account?"
        description={`This will stop ${deactivatingUser?.name || deactivatingUser?.email || 'this staff member'} from signing in. Their historical records stay connected for audit and reporting.`}
        confirmLabel="Deactivate"
        onConfirm={deactivateStaff}
      />
    </div>
  );
}
