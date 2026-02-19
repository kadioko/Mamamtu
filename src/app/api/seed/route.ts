import { NextResponse } from 'next/server';
import { PrismaClient, UserRole, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// One-time seed endpoint for Vercel deployment
// Call POST /api/seed once to populate the database
export async function POST() {
  try {
    // Prevent accidental re-seeding
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Database already seeded. Delete existing data first.' },
        { status: 400 }
      );
    }

    // Password for all seeded users
    const password = 'Demo2025!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create users
    const admin = await prisma.user.create({
      data: {
        name: 'Dr. Amina Hassan',
        email: 'admin@mama-tu.health',
        hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    const provider = await prisma.user.create({
      data: {
        name: 'Dr. Omar Al-Sayed',
        email: 'provider@mama-tu.health',
        role: UserRole.HEALTHCARE_PROVIDER,
        hashedPassword,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    const receptionist = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'reception@mama-tu.health',
        role: UserRole.RECEPTIONIST,
        hashedPassword,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Healthcare staff created');

    // Create sample patients
    const patientsData = [
      {
        patientId: 'PT-0001',
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        gender: 'FEMALE',
        phone: '+255700000001', // Tanzania country code
        email: 'fatima@mama-tu.demo',
        bloodType: 'O+',
        medicalHistory: 'Pregnancy care, routine checkups',
        city: 'Dar es Salaam',
        country: 'Tanzania',
      },
      {
        patientId: 'PT-0002',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        gender: 'MALE',
        phone: '+255700000002', // Tanzania country code
        email: 'ahmed@mama-tu.demo',
        bloodType: 'A+',
        medicalHistory: 'Hypertension, routine screenings',
        city: 'Mwanza',
        country: 'Tanzania',
      },
      {
        patientId: 'PT-0003',
        firstName: 'Grace',
        lastName: 'Njoroge',
        gender: 'FEMALE',
        phone: '+255700000003', // Tanzania country code
        email: 'grace@mama-tu.demo',
        bloodType: 'B+',
        medicalHistory: 'Postnatal care, vaccination schedule',
        city: 'Arusha',
        country: 'Tanzania',
      },
    ];

    for (const patientData of patientsData) {
      await prisma.patient.create({ data: patientData });
    }

    const patients = await prisma.patient.findMany();
    console.log(`✅ Created ${patients.length} patients`);

    // Create appointments
    const appointmentsData = [
      {
        title: 'Initial Prenatal Consultation',
        description: 'First pregnancy visit and basic checkup',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
        status: AppointmentStatus.SCHEDULED,
        type: AppointmentType.PRENATAL_CARE,
        location: 'Room 101',
        patientId: patients[0].id,
        createdById: provider.id,
      },
      {
        title: 'Routine Checkup',
        description: 'Annual health checkup',
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min later
        status: AppointmentStatus.CONFIRMED,
        type: AppointmentType.CONSULTATION,
        location: 'Room 102',
        patientId: patients[1].id,
        createdById: provider.id,
      },
      {
        title: 'Postnatal Follow-up',
        description: '6-week postnatal checkup with baby',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min ago
        status: AppointmentStatus.COMPLETED,
        type: AppointmentType.CONSULTATION,
        location: 'Room 101',
        patientId: patients[2].id,
        createdById: provider.id,
        notes: 'Mother and baby doing well. Baby weight 3.2kg, good feeding.'
      },
    ];

    for (const appointmentData of appointmentsData) {
      await prisma.appointment.create({ data: appointmentData });
    }

    console.log('✅ Appointments created');

    // Demo stats
    const totalPatients = await prisma.patient.count();
    const totalAppointments = await prisma.appointment.count();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: { admin, provider, receptionist },
        stats: {
          patients: totalPatients,
          appointments: totalAppointments,
        },
        credentials: {
          password: 'Demo2025!',
          accounts: [
            { role: 'Administrator', email: admin.email },
            { role: 'Healthcare Provider', email: provider.email },
            { role: 'Receptionist', email: receptionist.email },
          ],
        },
      },
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check if database is seeded
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();

    return NextResponse.json({
      isSeeded: userCount > 0,
      stats: {
        users: userCount,
        patients: patientCount,
        appointments: appointmentCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
