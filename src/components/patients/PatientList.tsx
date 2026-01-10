'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Patient, PatientsResponse } from '@/types/patient';
import { getPatients, deletePatient } from '@/services/patientService';
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
}

export function PatientList({ 
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  totalPages: initialTotalPages = 1,
  totalItems: initialTotalItems = 0,
  loading: propLoading = false,
  onDataLoaded = () => {},
  basePath = '/patients'
}: PatientListProps) {
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
  
  // Add lastVisit to the Patient type for display purposes
  type PatientWithLastVisit = Patient & {
    lastVisit?: Date;
  };

  // Update loading state when prop changes
  useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    if (searchTerm === undefined) return;
    setInternalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage === undefined) return;
    setPagination(prev => ({
      ...prev,
      page: currentPage,
    }));
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
      onDataLoaded({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
    } catch (err) {
      setError('Failed to load patients');
      console.error(err);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, internalSearchTerm, onDataLoaded]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInternalSearchTerm(nextValue);
    onSearchChange?.(nextValue);
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
    onPageChange?.(1);
  };

  const handleGoToPage = (nextPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: nextPage,
    }));
    onPageChange?.(nextPage);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(id);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error('Failed to delete patient');
      }
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search patients..."
            value={internalSearchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <Link href={`${basePath}/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading patients...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-8">
          <p>No patients found</p>
          <Link href={`${basePath}/new`}>
            <Button variant="link">Add your first patient</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: PatientWithLastVisit) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`${basePath}/${patient.id}`}
                        className="hover:underline hover:text-primary"
                      >
                        {`${patient.firstName} ${patient.lastName}`}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.patientId || 'N/A'}</TableCell>
                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`${basePath}/${patient.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View patient"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`${basePath}/${patient.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit patient"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(patient.id)}
                          aria-label="Delete patient"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGoToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
