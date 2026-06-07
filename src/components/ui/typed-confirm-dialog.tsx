'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface TypedConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmationText: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export function TypedConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationText,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
}: TypedConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');
  const isConfirmed = useMemo(
    () => typedValue.trim().toLowerCase() === confirmationText.trim().toLowerCase(),
    [confirmationText, typedValue],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setTypedValue('');
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="typed-confirm">
            Type <span className="font-semibold text-foreground">{confirmationText}</span> to continue
          </Label>
          <Input
            id="typed-confirm"
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value)}
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            disabled={!isConfirmed}
            onClick={() => {
              setTypedValue('');
              onOpenChange(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
