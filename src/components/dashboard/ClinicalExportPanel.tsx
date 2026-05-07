'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Download, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ExportType = 'patients' | 'appointments' | 'medical-records';
type ExportFormat = 'csv' | 'pdf';
type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

type ClinicalExportPanelProps = {
  userRole: string;
};

const exportTypeLabels: Record<ExportType, string> = {
  patients: 'Patients',
  appointments: 'Appointments',
  'medical-records': 'Medical records',
};

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  pdf: 'PDF',
};

function getFilename(response: Response, fallback: string) {
  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export function ClinicalExportPanel({ userRole }: ClinicalExportPanelProps) {
  const [exportType, setExportType] = useState<ExportType>('patients');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [message, setMessage] = useState('Exports are audited and available to verified care-team accounts.');

  const canViewAuditLog = userRole === 'ADMIN';
  const dateFiltersEnabled = exportType !== 'patients';

  async function handleExport() {
    if (dateFiltersEnabled && ((startDate && !endDate) || (!startDate && endDate))) {
      setStatus('error');
      setMessage('Choose both start and end dates, or leave the date range empty.');
      return;
    }

    if (dateFiltersEnabled && startDate && endDate && startDate > endDate) {
      setStatus('error');
      setMessage('The start date must be before the end date.');
      return;
    }

    setStatus('loading');
    setMessage(`Preparing ${exportTypeLabels[exportType].toLowerCase()} ${formatLabels[format]} export...`);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: exportType,
          format,
          ...(dateFiltersEnabled && startDate && endDate
            ? { filters: { dateRange: { start: startDate, end: endDate } } }
            : {}),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? 'Export failed');
      }

      const blob = await response.blob();
      const filename = getFilename(response, `${exportType}.${format}`);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setStatus('success');
      setMessage(`Downloaded ${filename}. This export was recorded in the audit log.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Export failed');
    }
  }

  return (
    <Card>
      <CardHeader className="gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Exports
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Download operational data for handoff, reconciliation, and continuity reporting.
          </p>
        </div>
        {canViewAuditLog ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/audit">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Audit Log
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="export-type">Dataset</Label>
            <Select value={exportType} onValueChange={(value) => setExportType(value as ExportType)}>
              <SelectTrigger id="export-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patients">Patients</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="medical-records">Medical records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-start">Start date</Label>
            <Input
              id="export-start"
              type="date"
              value={startDate}
              disabled={!dateFiltersEnabled}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-end">End date</Label>
            <Input
              id="export-end"
              type="date"
              value={endDate}
              disabled={!dateFiltersEnabled}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            {status === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            )}
            <span>{message}</span>
          </div>
          <Button onClick={handleExport} disabled={status === 'loading'} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {status === 'loading' ? 'Preparing...' : 'Download Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
