import '@testing-library/jest-dom';
// import { server } from './msw-server';

// Start MSW server before all tests
// beforeAll(() => server.listen());

// Reset request handlers after each test
// afterEach(() => server.resetHandlers());

// Close MSW server after all tests
// afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      expires: '9999-12-31T23:59:59.999Z',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    expires: '9999-12-31T23:59:59.999Z',
  })),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    patient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    medicalRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    content: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  },
}));

// Mock Logger
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    withContext: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

// Mock i18n
// jest.mock('@/lib/i18n', () => ({
//   useTranslation: () => ({
//     t: (key: string) => key,
//     changeLanguage: jest.fn(),
//     language: 'en',
//   },
//   TranslationProvider: ({ children }: { children: React.ReactNode }) => children,
// }));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
export const createMockPatient = (overrides = {}) => ({
  id: 'patient-1',
  patientId: 'P001',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'FEMALE',
  phone: '+254712345678',
  email: 'jane.doe@example.com',
  address: '123 Test St',
  city: 'Nairobi',
  state: 'Nairobi',
  postalCode: '00100',
  country: 'Kenya',
  bloodType: 'O+',
  allergies: ['Penicillin'],
  medicalHistory: 'No significant medical history',
  emergencyContactName: 'John Doe',
  emergencyContactPhone: '+254712345679',
  insuranceProvider: 'NHIF',
  insuranceNumber: 'NHIF123456',
  notes: 'Regular patient',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

export const createMockAppointment = (overrides = {}) => ({
  id: 'appointment-1',
  title: 'Prenatal Checkup',
  description: 'Regular prenatal examination',
  startTime: new Date('2023-12-01T10:00:00Z'),
  endTime: new Date('2023-12-01T11:00:00Z'),
  status: 'SCHEDULED',
  type: 'CONSULTATION',
  location: 'Main Clinic',
  notes: 'Patient is 20 weeks pregnant',
  patientId: 'patient-1',
  createdAt: new Date('2023-11-01'),
  updatedAt: new Date('2023-11-01'),
  ...overrides,
});

export const createMockMedicalRecord = (overrides = {}) => ({
  id: 'record-1',
  patientId: 'patient-1',
  recordType: 'CONSULTATION',
  title: 'Initial Consultation',
  description: 'First prenatal visit',
  diagnosis: 'Healthy pregnancy',
  symptoms: ['Nausea', 'Fatigue'],
  treatment: 'Prenatal vitamins',
  medications: ['Folic acid'],
  labResults: ['Blood type: O+', 'HIV: Negative'],
  vitals: {
    bloodPressure: '120/80',
    heartRate: 80,
    temperature: 36.6,
    weight: 65,
    height: 165,
  },
  healthcareProvider: 'Dr. Smith',
  facility: 'Main Clinic',
  notes: 'Patient responding well',
  attachments: ['ultrasound_1.jpg'],
  recordedBy: 'user-1',
  createdAt: new Date('2023-11-01'),
  updatedAt: new Date('2023-11-01'),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Dr. John Smith',
  email: 'john.smith@hospital.com',
  role: 'HEALTHCARE_PROVIDER',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

export const createMockContent = (overrides = {}) => ({
  id: 'content-1',
  title: 'Prenatal Care Guide',
  slug: 'prenatal-care-guide',
  description: 'Comprehensive guide to prenatal care',
  content: 'Prenatal care is important...',
  type: 'ARTICLE',
  difficulty: 'BEGINNER',
  duration: 30,
  isPublished: true,
  publishedAt: new Date('2023-01-01'),
  authorId: 'user-1',
  categoryId: 'category-1',
  tags: ['prenatal', 'care', 'guide'],
  viewCount: 150,
  averageRating: 4.5,
  ratingsCount: 30,
  isFeatured: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: 'notification-1',
  type: 'APPOINTMENT_REMINDER',
  title: 'Appointment Reminder',
  message: 'You have an appointment tomorrow',
  channel: 'EMAIL',
  status: 'PENDING',
  userId: 'user-1',
  appointmentId: 'appointment-1',
  scheduledFor: new Date('2023-12-01T09:00:00Z'),
  priority: 1,
  createdAt: new Date('2023-11-30'),
  updatedAt: new Date('2023-11-30'),
  ...overrides,
});
