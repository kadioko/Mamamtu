import { NextRequest, NextResponse } from 'next/server';
import {
  PrismaClient,
  UserRole,
  AppointmentStatus,
  AppointmentType,
  ContentType,
  DifficultyLevel,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function isSeedRequestAuthorized(request: NextRequest): boolean {
  const configuredToken = process.env.SEED_DATABASE_TOKEN;

  if (configuredToken) {
    return request.headers.get('x-seed-token') === configuredToken;
  }

  return process.env.NODE_ENV !== 'production';
}

function unauthorizedSeedResponse() {
  return NextResponse.json(
    { error: 'Seed endpoint is disabled. Configure SEED_DATABASE_TOKEN and send it as x-seed-token.' },
    { status: 403 }
  );
}

const educationCategories = [
  { name: 'Pregnancy Basics', description: 'Foundational guidance for pregnancy care and healthy routines.', slug: 'pregnancy-basics' },
  { name: 'Newborn Care', description: 'Practical newborn health, feeding, and safety education.', slug: 'newborn-care' },
  { name: 'Warning Signs', description: 'When to seek urgent care during pregnancy and after birth.', slug: 'warning-signs' },
  { name: 'Nutrition', description: 'Nutrition guidance for pregnancy, breastfeeding, and recovery.', slug: 'nutrition' },
];

const educationContents = [
  {
    title: 'Your First Antenatal Visit',
    slug: 'your-first-antenatal-visit',
    description: 'What to expect during the first clinic visit, including screening and care planning.',
    content: 'Your first antenatal visit helps the care team understand your health, estimate pregnancy dates, screen for risks, and plan follow-up visits. Bring current medicines, previous clinic records, and questions you want answered.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 6,
    categorySlug: 'pregnancy-basics',
    tags: ['antenatal', 'pregnancy', 'clinic visit'],
    isFeatured: true,
  },
  {
    title: 'Danger Signs During Pregnancy',
    slug: 'danger-signs-during-pregnancy',
    description: 'Symptoms that need urgent medical attention.',
    content: 'Seek urgent care if you notice heavy bleeding, severe headache, blurred vision, swelling of the face or hands, fever, severe abdominal pain, convulsions, or reduced baby movements. Quick care can protect both mother and baby.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 5,
    categorySlug: 'warning-signs',
    tags: ['danger signs', 'emergency', 'pregnancy'],
    isFeatured: true,
  },
  {
    title: 'Eating Well During Pregnancy',
    slug: 'eating-well-during-pregnancy',
    description: 'Simple food choices that support maternal health and fetal growth.',
    content: 'Aim for regular meals with vegetables, fruits, whole grains, beans, eggs, fish, lean meats, milk, and safe drinking water. Take prescribed iron and folic acid, and ask your clinician before using supplements or herbal medicines.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 7,
    categorySlug: 'nutrition',
    tags: ['nutrition', 'iron', 'folic acid'],
    isFeatured: false,
  },
  {
    title: 'Breastfeeding in the First Hour',
    slug: 'breastfeeding-in-the-first-hour',
    description: 'Why early breastfeeding matters and how caregivers can support it.',
    content: 'Starting breastfeeding within the first hour helps keep the baby warm, supports bonding, and gives the baby colostrum. Colostrum is the first milk and is rich in protection for the newborn.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 4,
    categorySlug: 'newborn-care',
    tags: ['breastfeeding', 'newborn', 'colostrum'],
    isFeatured: true,
  },
  {
    title: 'Newborn Warning Signs',
    slug: 'newborn-warning-signs',
    description: 'Signs in a newborn that should prompt immediate clinic or hospital care.',
    content: 'Get urgent care if a newborn has trouble breathing, fever or low temperature, poor feeding, yellow palms or soles, convulsions, severe weakness, repeated vomiting, or pus around the cord or eyes.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 5,
    categorySlug: 'warning-signs',
    tags: ['newborn', 'danger signs', 'urgent care'],
    isFeatured: true,
  },
  {
    title: 'Postnatal Recovery Checklist',
    slug: 'postnatal-recovery-checklist',
    description: 'A simple checklist for rest, bleeding, mood, feeding, and follow-up after birth.',
    content: 'After birth, monitor bleeding, pain, fever, mood, feeding, and wound healing. Attend postnatal visits even when you feel well. Ask for help early if you feel overwhelmed, very sad, or unsafe.',
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: 6,
    categorySlug: 'pregnancy-basics',
    tags: ['postnatal', 'recovery', 'mental health'],
    isFeatured: false,
  },
];

async function seedEducationContent(authorId: string) {
  const categoriesBySlug = new Map<string, string>();

  for (const category of educationCategories) {
    const savedCategory = await prisma.contentCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
      select: { id: true, slug: true },
    });
    categoriesBySlug.set(savedCategory.slug, savedCategory.id);
  }

  for (const item of educationContents) {
    const categoryId = categoriesBySlug.get(item.categorySlug);
    if (!categoryId) continue;

    await prisma.content.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        content: item.content,
        type: item.type,
        difficulty: item.difficulty,
        duration: item.duration,
        categoryId,
        tags: item.tags,
        isPublished: true,
        publishedAt: new Date(),
        isFeatured: item.isFeatured,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        content: item.content,
        type: item.type,
        difficulty: item.difficulty,
        duration: item.duration,
        authorId,
        categoryId,
        tags: item.tags,
        isPublished: true,
        publishedAt: new Date(),
        isFeatured: item.isFeatured,
      },
    });
  }
}

// One-time seed endpoint for Vercel deployment
// Call POST /api/seed once to populate the database
export async function POST(request: NextRequest) {
  if (!isSeedRequestAuthorized(request)) {
    return unauthorizedSeedResponse();
  }

  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      const author = await prisma.user.findFirst({
        where: { role: { in: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER] } },
        select: { id: true },
      });

      if (!author) {
        return NextResponse.json(
          { error: 'Database has users, but no admin or provider author for education content.' },
          { status: 400 }
        );
      }

      await seedEducationContent(author.id);

      const [userCount, patientCount, appointmentCount, categoryCount, contentCount] = await Promise.all([
        prisma.user.count(),
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.contentCategory.count(),
        prisma.content.count(),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Education content seeded successfully',
        data: {
          stats: {
            users: userCount,
            patients: patientCount,
            appointments: appointmentCount,
            educationCategories: categoryCount,
            educationResources: contentCount,
          },
        },
      });
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
        dateOfBirth: new Date('1995-03-15'),
        gender: 'FEMALE',
        phone: '+255700000001',
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
        dateOfBirth: new Date('1988-07-22'),
        gender: 'MALE',
        phone: '+255700000002',
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
        dateOfBirth: new Date('1992-11-08'),
        gender: 'FEMALE',
        phone: '+255700000003',
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
        type: AppointmentType.CONSULTATION,
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

    await seedEducationContent(admin.id);

    // Demo stats
    const totalPatients = await prisma.patient.count();
    const totalAppointments = await prisma.appointment.count();
    const totalCategories = await prisma.contentCategory.count();
    const totalContent = await prisma.content.count();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: { admin, provider, receptionist },
        stats: {
          patients: totalPatients,
          appointments: totalAppointments,
          educationCategories: totalCategories,
          educationResources: totalContent,
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
export async function GET(request: NextRequest) {
  if (!isSeedRequestAuthorized(request)) {
    return unauthorizedSeedResponse();
  }

  try {
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();
    const categoryCount = await prisma.contentCategory.count();
    const contentCount = await prisma.content.count();

    return NextResponse.json({
      isSeeded: userCount > 0,
      stats: {
        users: userCount,
        patients: patientCount,
        appointments: appointmentCount,
        educationCategories: categoryCount,
        educationResources: contentCount,
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
