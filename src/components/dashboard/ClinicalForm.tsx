'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ClinicalField =
  | { name: string; label: string; type?: 'text' | 'date' | 'number'; required?: boolean }
  | { name: string; label: string; type: 'textarea'; required?: boolean }
  | { name: string; label: string; type: 'select'; options: Array<{ label: string; value: string }>; required?: boolean }
  | { name: string; label: string; type: 'tags'; placeholder?: string; required?: boolean };

export function ClinicalForm({
  endpoint,
  method = 'POST',
  fields,
  defaults = {},
  successPath,
  submitLabel = 'Save',
}: {
  endpoint: string;
  method?: 'POST' | 'PUT';
  fields: ClinicalField[];
  defaults?: Record<string, string | number | string[] | null | undefined>;
  successPath: string;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      const value = defaults[field.name];
      initial[field.name] = Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value);
    }
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const setValue = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        const value = values[field.name]?.trim();
        if (!value) continue;
        if (field.type === 'tags') payload[field.name] = value.split(',').map((item) => item.trim()).filter(Boolean);
        else if (field.type === 'number') payload[field.name] = Number(value);
        else payload[field.name] = value;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Saved successfully');
      router.push(successPath as any);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea id={field.name} value={values[field.name] || ''} onChange={(event) => setValue(field.name, event.target.value)} required={field.required} rows={4} />
          ) : field.type === 'select' ? (
            <Select value={values[field.name] || ''} onValueChange={(value) => setValue(field.name, value)} required={field.required}>
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.name}
              type={field.type === 'tags' ? 'text' : field.type || 'text'}
              value={values[field.name] || ''}
              onChange={(event) => setValue(field.name, event.target.value)}
              required={field.required}
              placeholder={field.type === 'tags' ? field.placeholder || 'Separate values with commas' : undefined}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );
}
