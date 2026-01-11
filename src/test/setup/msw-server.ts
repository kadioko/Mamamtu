import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
const handlers = [
  // Auth endpoints
  rest.post('/api/auth/signin', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN',
        },
      })
    );
  }),

  rest.post('/api/auth/signout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Patient endpoints
  rest.get('/api/patients', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1');
    const limit = parseInt(req.url.searchParams.get('limit') || '10');
    
    const mockPatients = Array.from({ length: limit }, (_, i) => ({
      id: `patient-${i + 1}`,
      patientId: `P${String(i + 1).padStart(3, '0')}`,
      firstName: `Patient${i + 1}`,
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      phone: '+254712345678',
      email: `patient${i + 1}@test.com`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return res(
      ctx.status(200),
      ctx.json({
        data: mockPatients,
        pagination: {
          page,
          limit,
          total: 100,
          totalPages: Math.ceil(100 / limit),
        },
      })
    );
  }),

  rest.post('/api/patients', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-patient-id',
        patientId: 'P001',
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  rest.get('/api/patients/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'not-found') {
      return res(ctx.status(404), ctx.json({ error: 'Patient not found' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        id,
        patientId: 'P001',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        phone: '+254712345678',
        email: 'jane.doe@test.com',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  // Appointment endpoints
  rest.get('/api/appointments', (req, res, ctx) => {
    const mockAppointments = [
      {
        id: 'appointment-1',
        title: 'Prenatal Checkup',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'SCHEDULED',
        type: 'CONSULTATION',
        patientId: 'patient-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return res(ctx.status(200), ctx.json(mockAppointments));
  }),

  rest.post('/api/appointments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-appointment-id',
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  // Medical Record endpoints
  rest.get('/api/medical-records', (req, res, ctx) => {
    const patientId = req.url.searchParams.get('patientId');
    
    const mockRecords = [
      {
        id: 'record-1',
        patientId: patientId || 'patient-1',
        recordType: 'CONSULTATION',
        title: 'Initial Consultation',
        diagnosis: 'Healthy pregnancy',
        symptoms: ['Nausea', 'Fatigue'],
        medications: ['Folic acid'],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 80,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return res(ctx.status(200), ctx.json(mockRecords));
  }),

  rest.post('/api/medical-records', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-record-id',
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  // Content endpoints
  rest.get('/api/content', (req, res, ctx) => {
    const mockContent = [
      {
        id: 'content-1',
        title: 'Prenatal Care Guide',
        slug: 'prenatal-care-guide',
        type: 'ARTICLE',
        difficulty: 'BEGINNER',
        isPublished: true,
        viewCount: 150,
        averageRating: 4.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return res(ctx.status(200), ctx.json(mockContent));
  }),

  // Notification endpoints
  rest.get('/api/notifications', (req, res, ctx) => {
    const mockNotifications = [
      {
        id: 'notification-1',
        type: 'APPOINTMENT_REMINDER',
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return res(ctx.status(200), ctx.json(mockNotifications));
  }),

  // Health check endpoint
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
      })
    );
  }),

  // API docs endpoint
  rest.get('/api/docs', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        openapi: '3.0.0',
        info: {
          title: 'MamaMtu API',
          version: '1.0.0',
        },
        paths: {},
      })
    );
  }),

  // Error handlers for testing
  rest.get('/api/test/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  }),

  rest.get('/api/test/not-found', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Not found' })
    );
  }),
];

// Create MSW server
export const server = setupServer(...handlers);
