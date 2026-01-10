import { getPatients, getPatient, createPatient, updatePatient, deletePatient } from '@/services/patientService';

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

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients?');
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

      const result = await getPatients({ search: 'Jane', page: 2 as any, filter: '' as any });

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients?search=Jane&page=2');
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

      expect(globalAny.fetch).toHaveBeenCalledWith('/api/patients/p1');
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
});
