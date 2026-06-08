'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Copy, Edit, KeyRound, Lock, RotateCcwKey, ShieldCheck, Trash2, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TypedConfirmDialog } from '@/components/ui/typed-confirm-dialog';
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
  accountLockedUntil: Date | string | null;
  failedLoginAttempts: number;
  passwordResetExpires: Date | string | null;
  facilityName?: string | null;
  createdAt: Date | string;
}

interface StaffUserManagerProps {
  users: StaffUser[];
  currentUserId: string;
  canEditRoles?: boolean;
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

function isFutureDate(value: Date | string | null) {
  if (!value) return false;
  return new Date(value).getTime() > Date.now();
}

export function StaffUserManager({ users, currentUserId, canEditRoles = true }: StaffUserManagerProps) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<StaffUser | null>(null);
  const [accessAction, setAccessAction] = useState<{ user: StaffUser; action: 'lock' | 'unlock' | 'force-reset' } | null>(null);
  const [resetLink, setResetLink] = useState<{ url: string; expires: string | null; user: StaffUser } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccessSaving, setIsAccessSaving] = useState(false);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const admins = users.filter((user) => user.role === 'ADMIN' && user.isActive).length;
    const providers = users.filter((user) => user.role === 'HEALTHCARE_PROVIDER' && user.isActive).length;
    const receptionists = users.filter((user) => user.role === 'RECEPTIONIST' && user.isActive).length;
    const locked = users.filter((user) => isFutureDate(user.accountLockedUntil)).length;
    const resetPending = users.filter((user) => isFutureDate(user.passwordResetExpires)).length;

    return { active, inactive: users.length - active, admins, providers, receptionists, locked, resetPending };
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
          role: canEditRoles ? form.get('role') : editingUser.role,
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

  async function runAccessAction(actionToRun = accessAction) {
    if (!actionToRun) return;

    setIsAccessSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${actionToRun.user.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionToRun.action }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to update staff access');
      }

      if (actionToRun.action === 'force-reset' && payload.resetUrl) {
        setResetLink({
          url: payload.resetUrl,
          expires: payload.resetExpires ?? null,
          user: actionToRun.user,
        });
        toast.success('Password reset link generated');
      } else {
        toast.success(actionToRun.action === 'lock' ? 'Staff account locked' : 'Staff account unlocked');
      }

      setAccessAction(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update staff access');
    } finally {
      setIsAccessSaving(false);
    }
  }

  async function copyResetLink() {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink.url);
      toast.success('Reset link copied');
    } catch {
      toast.error('Could not copy reset link');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
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
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Locked</p>
          <p className="text-2xl font-semibold">{stats.locked}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Reset pending</p>
          <p className="text-2xl font-semibold">{stats.resetPending}</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const locked = isFutureDate(user.accountLockedUntil);
          const resetPending = isFutureDate(user.passwordResetExpires);

          return (
            <div
              key={user.id}
              className="grid gap-3 rounded-lg border p-4 text-sm xl:grid-cols-[1.3fr_0.8fr_0.9fr_1fr_0.8fr_1.7fr]"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name || 'Unnamed'}</p>
                  {isSelf && <Badge variant="secondary">You</Badge>}
                  {locked && <Badge variant="destructive">Locked</Badge>}
                  {resetPending && <Badge variant="outline">Reset pending</Badge>}
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
                <span className="text-muted-foreground">Clinic</span>
                <p>{user.facilityName || 'Unassigned'}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Status</span>
                <p className={user.isActive ? 'text-green-700' : 'text-muted-foreground'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
                {user.failedLoginAttempts > 0 ? (
                  <p className="text-xs text-muted-foreground">{user.failedLoginAttempts} failed attempts</p>
                ) : null}
              </div>

              <div>
                <span className="text-muted-foreground">Last login</span>
                <p>{formatDate(user.lastLogin)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSelf || isAccessSaving}
                  onClick={() => setAccessAction({ user, action: locked ? 'unlock' : 'lock' })}
                >
                  {locked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                  {locked ? 'Unlock' : 'Lock'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSelf || isAccessSaving}
                  onClick={() => setAccessAction({ user, action: 'force-reset' })}
                >
                  <RotateCcwKey className="mr-2 h-4 w-4" />
                  Force Reset
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
                  <Select name="role" defaultValue={editingUser.role} disabled={!canEditRoles}>
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

      <TypedConfirmDialog
        open={!!deactivatingUser}
        onOpenChange={(open) => !open && setDeactivatingUser(null)}
        title="Deactivate staff account?"
        description={`This will stop ${deactivatingUser?.name || deactivatingUser?.email || 'this staff member'} from signing in. Their historical records stay connected for audit and reporting.`}
        confirmationText={deactivatingUser?.email || 'deactivate'}
        confirmLabel="Deactivate"
        onConfirm={deactivateStaff}
      />

      {accessAction?.action === 'force-reset' ? (
        <TypedConfirmDialog
          open={!!accessAction}
          onOpenChange={(open) => !open && setAccessAction(null)}
          title="Force password reset?"
          description={`This will lock ${accessAction.user.name || accessAction.user.email || 'this staff member'} until they set a new password with the generated reset link.`}
          confirmationText={accessAction.user.email || 'reset'}
          confirmLabel="Generate Reset Link"
          onConfirm={() => runAccessAction(accessAction)}
        />
      ) : (
        <ConfirmDialog
        open={!!accessAction}
        onOpenChange={(open) => !open && setAccessAction(null)}
        title={
          accessAction?.action === 'unlock'
              ? 'Unlock staff account?'
              : 'Lock staff account?'
        }
        description={
          accessAction?.action === 'unlock'
              ? `This clears lockout and failed attempts for ${accessAction.user.name || accessAction.user.email || 'this staff member'}.`
              : `This immediately blocks ${accessAction?.user.name || accessAction?.user.email || 'this staff member'} from signing in until an admin unlocks the account.`
        }
        confirmLabel={
          accessAction?.action === 'unlock'
              ? 'Unlock'
              : 'Lock'
        }
        variant={accessAction?.action === 'unlock' ? 'default' : 'destructive'}
        onConfirm={() => runAccessAction(accessAction)}
      />
      )}

      <Dialog open={!!resetLink} onOpenChange={(open) => !open && setResetLink(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Password Reset Link</DialogTitle>
            <DialogDescription>
              Share this link with {resetLink?.user.name || resetLink?.user.email || 'the staff member'}. The account stays locked until the password is reset.
            </DialogDescription>
          </DialogHeader>
          {resetLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-link">Reset link</Label>
                <div className="flex gap-2">
                  <Input id="reset-link" value={resetLink.url} readOnly className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={copyResetLink} aria-label="Copy reset link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Expires {resetLink.expires ? new Date(resetLink.expires).toLocaleString() : 'soon'}.
              </p>
              <DialogFooter>
                <Button type="button" onClick={() => setResetLink(null)}>Done</Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
