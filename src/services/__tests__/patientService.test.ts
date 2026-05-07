import { getPatients, getPatient, createPatient, updatePatient, deletePatient, searchPatients, getPatientMedicalRecords, exportPatients } from '@/services/patientService';

const globalAny: any = global;

describe('patientService', () => {
  beforeEach(() => {
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getPatients', () => {
    it('calls /api/patients? with no params and returns parsed JSON', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getPatients();

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients?', { credentials: 'include' });
      expect(result).toEqual(mockResponse);
    });

    it('builds query string from params and filters out empty values', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 2, limit: 5, totalPages: 0 },
      };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getPatients({ search: 'Jane', page: 2, filter: '' } as any);

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients?search=Jane&page=2', { credentials: 'include' });
      expect(result).toEqual(mockResponse);
    });

    it('throws when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(getPatients()).rejects.toThrow('Failed to fetch patients');
    });
  });

  describe('getPatient', () => {
    it('fetches a single patient by id', async () => {
      const mockPatient = { id: 'p1', firstName: 'Jane' };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPatient),
      });

      const result = await getPatient('p1');

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients/p1', { credentials: 'include' });
      expect(result).toEqual(mockPatient);
    });

    it('throws when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(getPatient('p1')).rejects.toThrow('Failed to fetch patient');
    });
  });

  describe('createPatient', () => {
    it('posts patient data and returns created patient', async () => {
      const input = { firstName: 'Jane' };
      const mockPatient = { id: 'p1', firstName: 'Jane' };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPatient),
      });

      const result = await createPatient(input as any);

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockPatient);
    });

    it('throws with server-provided message when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Create error' }),
      });

      await expect(createPatient({} as any)).rejects.toThrow('Create error');
    });
  });

  describe('updatePatient', () => {
    it('puts patient data and returns updated patient', async () => {
      const input = { firstName: 'Updated' };
      const mockPatient = { id: 'p1', firstName: 'Updated' };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPatient),
      });

      const result = await updatePatient('p1', input as any);

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients/p1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockPatient);
    });

    it('throws with server-provided message when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Update error' }),
      });

      await expect(updatePatient('p1', {} as any)).rejects.toThrow('Update error');
    });
  });

  describe('deletePatient', () => {
    it('sends DELETE request and resolves when ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn(),
      });

      await deletePatient('p1');

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients/p1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    it('throws with server-provided message when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Delete error' }),
      });

      await expect(deletePatient('p1')).rejects.toThrow('Delete error');
    });
  });

  describe('searchPatients', () => {
    it('calls /api/patients with search param and returns patient array', async () => {
      const mockPatients = [{ id: 'p1', firstName: 'Jane' }];
      const mockResponse = {
        data: mockPatients,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await searchPatients('Jane');

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/patients?search=Jane&limit=10',
        { credentials: 'include' }
      );
      expect(result).toEqual(mockPatients);
    });

    it('respects custom limit', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
      });

      await searchPatients('test', 5);

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/patients?search=test&limit=5',
        { credentials: 'include' }
      );
    });

    it('throws when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({ ok: false });
      await expect(searchPatients('fail')).rejects.toThrow('Failed to search patients');
    });
  });

  describe('getPatientMedicalRecords', () => {
    it('fetches medical records for a patient', async () => {
      const mockRecords = { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRecords),
      });

      const result = await getPatientMedicalRecords('p1');

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/patients/p1/records?',
        { credentials: 'include' }
      );
      expect(result).toEqual(mockRecords);
    });

    it('includes query params when provided', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
      });

      await getPatientMedicalRecords('p1', { page: 2, limit: 5, recordType: 'LAB_RESULT' });

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/patients/p1/records?page=2&limit=5&recordType=LAB_RESULT',
        { credentials: 'include' }
      );
    });

    it('throws when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({ ok: false });
      await expect(getPatientMedicalRecords('p1')).rejects.toThrow('Failed to fetch patient medical records');
    });
  });

  describe('exportPatients', () => {
    it('fetches CSV export and returns a Blob', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      const result = await exportPatients('csv');

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            type: 'patients',
            format: 'csv',
          }),
        }
      );
      expect(result).toBe(mockBlob);
    });

    it('defaults to csv format', async () => {
      const mockBlob = new Blob(['data']);
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      await exportPatients();

      expect(globalAny.fetch).toHaveBeenCalledWith(
        '/api/export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            type: 'patients',
            format: 'csv',
          }),
        }
      );
    });

    it('throws when response is not ok', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({ ok: false });
      await expect(exportPatients()).rejects.toThrow('Failed to export patients');
    });
  });
});
