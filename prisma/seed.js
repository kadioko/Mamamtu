// Clean Seed Script for MamaMtu Healthcare Demo
import { PrismaClient, UserRole, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MamaMtu demo database...');

  // Password for all seeded users
  const password = 'Demo2025!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mama-tu.health' },
    update: {},
    create: {
      name: 'Dr. Amina Hassan',
      email: 'admin@mama-tu.health',
      hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: 'provider@mama-tu.health' },
    update: {},
    create: {
      name: 'Dr. Omar Al-Sayed',
      email: 'provider@mama-tu.health',
      role: UserRole.HEALTHCARE_PROVIDER,
      hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@mama-tu.health' },
    update: {},
    create: {
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
      phone: '+254700000001',
      email: 'fatima@mama-tu.demo',
      bloodType: 'O+',
      medicalHistory: 'Pregnancy care, routine checkups',
      city: 'Nairobi',
      country: 'Kenya',
    },
    {
      patientId: 'PT-0002',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      gender: 'MALE',
      phone: '+254700000002',
      email: 'ahmed@mama-tu.demo',
      bloodType: 'A+',
      medicalHistory: 'Hypertension, routine screenings',
      city: 'Mombasa',
      country: 'Kenya',
    },
    {
      patientId: 'PT-0003',
      firstName: 'Grace',
      lastName: 'Njoroge',
      gender: 'FEMALE',
      phone: '+254700000003',
      email: 'grace@mama-tu.demo',
      bloodType: 'B+',
      medicalHistory: 'Postnatal care, vaccination schedule',
      city: 'Nairobi',
      country: 'Kenya',
    },
  ];

  for (const patientData of patientsData) {
    await prisma.patient.upsert({
      where: { patientId: patientData.patientId },
      update: {},
      create: patientData,
    });
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

  // Create medical records for completed appointments
  const completedAppointments = await prisma.appointment.findMany({
    where: { status: AppointmentStatus.COMPLETED }
  });

  if (completedAppointments.length > 0) {
    const medRecordData = [
      {
        type: 'CONSULTATION',
        title: 'Postnatal Consultation',
        description: '6-week postnatal checkup and immunizations',
        notes: 'Patient recovering well. Baby healthy, good weight gain.',
        data: JSON.stringify({
          chief_complaint: 'Postnatal checkup',
          examination: 'Physical exam normal',
          diagnosis: 'Pregnancy care follow-up',
          plan: 'Continue routine care, next visit in 6 months'
        }),
        patientId: patients[2].id,
        createdById: provider.id,
        appointmentId: completedAppointments[0].id,
      },
      {
        type: 'VITALS',
        title: 'Vital Signs',
        description: 'Blood pressure, heart rate, temperature measurements',
        notes: 'All vitals within normal range',
        data: JSON.stringify({
          temperature: '36.8°C',
          heartRate: '78 bpm',
          bloodPressure: '118/75 mmHg',
          oxygenSaturation: '98%',
          weight: '68 kg',
          height: '165 cm',
          bmi: '24.9'
        }),
        patientId: patients[1].id,
        createdById: provider.id,
        appointmentId: null,
      },
    ];

    for (const recordData of medRecordData) {
      await prisma.medicalRecord.create({ data: recordData });
    }

    console.log('✅ Medical records created');
  }

  // Demo stats
  const totalPatients = await prisma.patient.count();
  const totalAppointments = await prisma.appointment.count();
  const totalRecords = await prisma.medicalRecord.count();

  console.log('\n' + '='.repeat(60));
  console.log('🎯 MAMAMTU DEMO DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`👥 Patients: ${totalPatients}`);
  console.log(`📅 Appointments: ${totalAppointments}`);
  console.log(`📋 Medical Records: ${totalRecords}`);
  console.log('='.repeat(60));

  console.log('\n🔐 DEMO LOGIN CREDENTIALS');
  console.log('='.repeat(60));
  console.table([
    { Role: 'Administrator', Email: admin.email, Password: password },
    { Role: 'Healthcare Provider', Email: provider.email, Password: password },
    { Role: 'Receptionist', Email: receptionist.email, Password: password },
  ]);

  console.log('\n✨ Demo setup completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
