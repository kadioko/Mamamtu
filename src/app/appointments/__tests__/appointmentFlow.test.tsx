import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { MockedProvider } from '@apollo/client/testing';
import AppointmentsPage from '../page';
import { getAppointments, getPatients } from '@/services/appointmentService';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link to a simple anchor element for testing
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: ReactNode; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the appointment service
jest.mock('@/services/appointmentService', () => ({
  getAppointments: jest.fn(),
  getPatients: jest.fn(),
}));

describe('Appointment Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock getAppointments
    (getAppointments as jest.Mock).mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Prenatal Checkup',
          startTime: '2023-08-21T10:00:00.000Z',
          endTime: '2023-08-21T11:00:00.000Z',
          status: 'SCHEDULED',
          type: 'PRENATAL',
          patient: {
            id: 'p1',
            firstName: 'Jane',
            lastName: 'Doe',
          },
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    // Mock getPatients
    (getPatients as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'p1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+1234567890',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders appointments list', async () => {
    const ui = await AppointmentsPage();

    render(<MockedProvider>{ui}</MockedProvider>);

    // Check if the page title is rendered
    expect(screen.getByText('Appointments')).toBeInTheDocument();

    // Ensure we are working within the visible upcoming appointments tab
    const upcomingPanel = screen.getByRole('tabpanel');

    // Check if the appointment list shows the patient name within the upcoming panel
    expect(within(upcomingPanel).getByText('Jane Doe')).toBeInTheDocument();

    // Ensure the search input is present in the upcoming appointments tab
    expect(
      within(upcomingPanel).getByPlaceholderText('Search appointments...')
    ).toBeInTheDocument();
  });

  test('navigates to new appointment page', async () => {
    const ui = await AppointmentsPage();

    render(<MockedProvider>{ui}</MockedProvider>);

    // Click the new appointment button
    const newButton = screen.getByRole('button', { name: /new appointment/i });
    fireEvent.click(newButton);

    // Check if navigation was called
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/appointments/new');
    });
  });

  test('filters appointments using search input', async () => {
    const ui = await AppointmentsPage();

    render(<MockedProvider>{ui}</MockedProvider>);

    // Type in the search input within the visible tab panel (upcoming appointments)
    const upcomingPanel = screen.getByRole('tabpanel');
    const searchInput = within(upcomingPanel).getByPlaceholderText('Search appointments...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    // Check that the empty-state message is shown when no appointments match the search
    await waitFor(() => {
      expect(
        screen.getByText('No appointments found matching your search.')
      ).toBeInTheDocument();
    });
  });
});
