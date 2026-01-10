import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PatientList } from '../PatientList';
import { getPatients, deletePatient } from '@/services/patientService';
import type { Patient } from '@/types/patient';
import '@testing-library/jest-dom';

jest.mock('@/services/patientService', () => ({
  __esModule: true,
  getPatients: jest.fn(),
  deletePatient: jest.fn(),
}));

jest.mock('sonner', () => ({
  __esModule: true,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

const mockGetPatients = getPatients as jest.Mock;
const mockDeletePatient = deletePatient as jest.Mock;

const basePatient: Patient = {
  id: 'p1',
  patientId: 'P-001',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+123456789',
  dateOfBirth: '1990-01-01',
  gender: 'FEMALE',
  allergies: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PatientList', () => {
  const handleDataLoaded = jest.fn();

  it('renders patients list with data', async () => {
    mockGetPatients.mockResolvedValueOnce({
      data: [basePatient],
      pagination: { total: 1, page: 1, totalPages: 1 },
    });

    render(<PatientList onDataLoaded={handleDataLoaded} />);

    expect(screen.getByPlaceholderText('Search patients...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new patient/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('P-001')).toBeInTheDocument();
    });
  });

  it('calls onSearchChange when search input changes', async () => {
    mockGetPatients.mockResolvedValueOnce({
      data: [],
      pagination: { total: 0, page: 1, totalPages: 1 },
    });

    const handleSearchChange = jest.fn();

    render(
      <PatientList
        onSearchChange={handleSearchChange}
        onDataLoaded={handleDataLoaded}
      />
    );

    const input = screen.getByPlaceholderText('Search patients...');
    fireEvent.change(input, { target: { value: 'Jane' } });

    expect(handleSearchChange).toHaveBeenCalledWith('Jane');

    // Wait for the initial data load effect to complete so all state updates
    // are wrapped in React Testing Library's act(...) helpers.
    await waitFor(() => {
      expect(mockGetPatients).toHaveBeenCalled();
    });
  });

  it('shows empty state when no patients are returned', async () => {
    mockGetPatients.mockResolvedValueOnce({
      data: [],
      pagination: { total: 0, page: 1, totalPages: 1 },
    });

    render(<PatientList onDataLoaded={handleDataLoaded} />);

    await waitFor(() => {
      expect(screen.getByText('No patients found')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add your first patient/i })
      ).toBeInTheDocument();
    });
  });

  it('deletes a patient after confirmation and refetches list', async () => {
    mockGetPatients
      .mockResolvedValueOnce({
        data: [basePatient],
        pagination: { total: 1, page: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 1 },
      });

    mockDeletePatient.mockResolvedValueOnce(undefined);

    const confirmSpy = jest
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    render(<PatientList onDataLoaded={handleDataLoaded} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete patient/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeletePatient).toHaveBeenCalledWith('p1');
      expect(mockGetPatients.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    confirmSpy.mockRestore();
  });
});
