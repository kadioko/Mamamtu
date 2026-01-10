import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';

const globalAny: any = globalThis as any;

describe('DashboardPage', () => {
  beforeEach(() => {
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders metrics and recent appointments from API data', async () => {
    const metricsResponse = {
      activePatients: { count: 10 },
      upcomingAppointments: { count: 3 },
      activePregnancy: { count: 2 },
      alerts: { count: 1 },
    };

    const appointmentsResponse = {
      data: [
        {
          id: '1',
          type: 'PRENATAL_CHECKUP',
          patient: { firstName: 'Jane', lastName: 'Doe' },
          startTime: '2025-09-10T10:00:00Z',
          status: 'SCHEDULED',
        },
      ],
    };

    (globalAny.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(metricsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(appointmentsResponse),
      });

    render(<DashboardPage />);

    // Header should always render
    expect(screen.getByText('MamaMtu Dashboard')).toBeInTheDocument();

    // Ensure both API endpoints were called
    await waitFor(() => {
      expect(globalAny.fetch).toHaveBeenCalledTimes(2);
    });

    expect(globalAny.fetch).toHaveBeenNthCalledWith(1, '/api/dashboard/metrics');
    expect(globalAny.fetch).toHaveBeenNthCalledWith(
      2,
      '/api/appointments?limit=5&status=SCHEDULED,CONFIRMED',
    );

    // Recent appointment from API-mapped data
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(await screen.findByText('Prenatal Checkup')).toBeInTheDocument();
  });

  it('falls back to demo data when API calls fail', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (globalAny.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardPage />);

    // Header should still render
    expect(screen.getByText('MamaMtu Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      // Fallback metric values
      expect(screen.getByText('Active Patients')).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      // Fallback recent appointments
      expect(screen.getByText('Fatima Al-Rashid')).toBeInTheDocument();
      expect(screen.getByText('Sarah Mugo')).toBeInTheDocument();
      expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching dashboard data:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
