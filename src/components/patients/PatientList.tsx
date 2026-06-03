'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Patient, PatientsResponse } from '@/types/patient';
import { getPatients, deletePatient } from '@/services/patientService';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import Link from 'next/link';

interface PatientListProps {
  onAddNew?: () => void;
  onEdit?: (patient: Patient) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
  loading?: boolean;
  onDataLoaded?: (data: { total: number; totalPages: number }) => void;
  basePath?: string;
  readOnly?: boolean;
}

const noopDataLoaded = () => {};

export function PatientList({
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  totalPages: initialTotalPages = 1,
  totalItems: initialTotalItems = 0,
  loading: propLoading = false,
  onDataLoaded = noopDataLoaded,
  basePath = '/patients',
  readOnly = false,
}: PatientListProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm ?? '');
  const [pagination, setPagination] = useState({
    page: currentPage ?? 1,
    limit: 10,
    total: initialTotalItems,
    totalPages: initialTotalPages,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  type PatientWithLastVisit = Patient & { lastVisit?: Date };

  useEffect(() => { setLoading(propLoading); }, [propLoading]);

  useEffect(() => {
    if (searchTerm === undefined) return;
    setInternalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage === undefined) return;
    setPagination(prev => ({ ...prev, page: currentPage }));
  }, [currentPage]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data: PatientsResponse = await getPatients({
        page: pagination.page,
        limit: pagination.limit,
        search: internalSearchTerm,
      });
      setPatients(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
      setError(null);
      onDataLoaded({ total: data.pagination.total, totalPages: data.pagination.totalPages });
    } catch (err) {
      setError(t('patients.loadFailed'));
      console.error(err);
      toast.error(t('patients.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, internalSearchTerm, onDataLoaded, t]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInternalSearchTerm(nextValue);
    onSearchChange?.(nextValue);
    setPagination(prev => ({ ...prev, page: 1 }));
    onPageChange?.(1);
  };

  const handleGoToPage = (nextPage: number) => {
    setPagination(prev => ({ ...prev, page: nextPage }));
    onPageChange?.(nextPage);
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deletePatient(pendingDeleteId);
      toast.success(t('patients.deleteSuccess'));
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(t('patients.deleteFailed'));
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('dialog.deletePatient.title')}
        description={t('dialog.deletePatient.description')}
        confirmLabel={t('dialog.delete')}
        cancelLabel={t('dialog.cancel')}
        onConfirm={confirmDelete}
      />

      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder={t('patients.searchPatients')}
            value={internalSearchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        {!readOnly && (
          <Link href={`${basePath}/new` as any}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('patients.newPatient')}
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div>{t('patients.loading')}</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-8">
          <p>{t('patients.noPatients')}</p>
          {!readOnly && (
            <Link href={`${basePath}/new` as any}>
              <Button variant="link">{t('patients.addFirst')}</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('patients.columnName')}</TableHead>
                  <TableHead>{t('patients.columnId')}</TableHead>
                  <TableHead>{t('patients.columnPhone')}</TableHead>
                  <TableHead>{t('patients.columnLastVisit')}</TableHead>
                  <TableHead className="w-[120px]">{t('patients.columnActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: PatientWithLastVisit) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`${basePath}/${patient.id}` as any}
                        className="hover:underline hover:text-primary"
                      >
                        {`${patient.firstName} ${patient.lastName}`}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.patientId || t('common.notAvailable')}</TableCell>
                    <TableCell>{patient.phone || t('common.notAvailable')}</TableCell>
                    <TableCell>
                      {patient.lastVisit
                        ? new Date(patient.lastVisit).toLocaleDateString()
                        : t('common.notAvailable')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`${basePath}/${patient.id}` as any}>
                          <Button variant="ghost" size="icon" aria-label={t('patients.viewButton')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!readOnly && (
                          <>
                            <Link href={`${basePath}/${patient.id}/edit` as any}>
                              <Button variant="ghost" size="icon" aria-label={t('patients.editButton')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => requestDelete(patient.id)}
                              aria-label={t('patients.deleteButton')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGoToPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pagination')
              .replace('{page}', String(pagination.page))
              .replace('{totalPages}', String(pagination.totalPages))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGoToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
