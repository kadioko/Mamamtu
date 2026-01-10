import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MamaMtu API',
    description: 'API documentation for the MamaMtu Maternal & Newborn Health Support System',
    version: '1.0.0',
    contact: {
      name: 'MamaMtu Support',
      url: 'https://github.com/kadioko/Mamamtu',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Patients', description: 'Patient management endpoints' },
    { name: 'Appointments', description: 'Appointment management endpoints' },
    { name: 'Notifications', description: 'Notification management endpoints' },
    { name: 'Content', description: 'Educational content endpoints' },
    { name: 'Health', description: 'System health endpoints' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of the API',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheck',
                },
              },
            },
          },
          '503': {
            description: 'Service is degraded',
          },
        },
      },
    },
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'List patients',
        description: 'Returns a paginated list of patients',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientList',
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Patients'],
        summary: 'Create patient',
        description: 'Creates a new patient record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PatientInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Patient created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Patient',
                },
              },
            },
          },
          '400': { description: 'Invalid input' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Get patient',
        description: 'Returns a single patient by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Patient',
                },
              },
            },
          },
          '404': { description: 'Patient not found' },
        },
      },
      put: {
        tags: ['Patients'],
        summary: 'Update patient',
        description: 'Updates an existing patient record',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PatientInput',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Patient updated' },
          '404': { description: 'Patient not found' },
        },
      },
      delete: {
        tags: ['Patients'],
        summary: 'Delete patient',
        description: 'Deletes a patient record',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Patient deleted' },
          '404': { description: 'Patient not found' },
        },
      },
    },
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments',
        description: 'Returns a paginated list of appointments',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
            },
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AppointmentList',
                },
              },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        description: 'Returns notifications for the current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NotificationList',
                },
              },
            },
          },
        },
      },
    },
    '/content': {
      get: {
        tags: ['Content'],
        summary: 'List educational content',
        description: 'Returns a list of educational content',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['ARTICLE', 'VIDEO', 'PDF'],
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded', 'error'] },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
          checks: {
            type: 'object',
            properties: {
              database: { type: 'string' },
              memory: { type: 'string' },
            },
          },
        },
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          patientId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bloodType: { type: 'string' },
          allergies: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PatientInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bloodType: { type: 'string' },
          allergies: { type: 'array', items: { type: 'string' } },
        },
      },
      PatientList: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Patient' },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
          },
          type: { type: 'string' },
          patientId: { type: 'string' },
        },
      },
      AppointmentList: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Appointment' },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      NotificationList: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Notification' },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
