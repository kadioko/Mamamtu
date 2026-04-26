require('dotenv/config');

const {
  AppointmentStatus,
  AppointmentType,
  AuditAction,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  PregnancyStatus,
  PrismaClient,
  RecordType,
  UserRole,
} = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

function getDatabaseUrlForPgAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const url = new URL(databaseUrl);
  if (url.searchParams.get('sslmode') === 'require' && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('uselibpqcompat', 'true');
  }
  return url.toString();
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrlForPgAdapter(), max: 1 }),
});

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
};

const yearsAgo = (years, month = 0, day = 1) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const patients = [
  {
    patientId: 'DEMO-0001',
    firstName: 'Asha',
    lastName: 'Mwangi',
    dateOfBirth: yearsAgo(28, 2, 14),
    gender: 'FEMALE',
    phone: '+254711000101',
    email: 'asha.mwangi@example.com',
    city: 'Nairobi',
    country: 'Kenya',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    medicalHistory: 'Previous pre-eclampsia at 36 weeks. Currently monitored as high-risk pregnancy.',
    emergencyContactName: 'Peter Mwangi',
    emergencyContactPhone: '+254711000102',
    notes: 'Needs blood pressure review at each visit.',
    scenario: 'high-risk-active-pregnancy',
  },
  {
    patientId: 'DEMO-0002',
    firstName: 'Neema',
    lastName: 'Otieno',
    dateOfBirth: yearsAgo(19, 6, 8),
    gender: 'FEMALE',
    phone: '+254722000201',
    city: 'Kisumu',
    country: 'Kenya',
    bloodType: 'A+',
    allergies: [],
    medicalHistory: 'First pregnancy. Mild anemia identified at booking.',
    emergencyContactName: 'Grace Otieno',
    emergencyContactPhone: '+254722000202',
    notes: 'Benefits from youth-friendly counseling and nutrition support.',
    scenario: 'teen-first-pregnancy',
  },
  {
    patientId: 'DEMO-0003',
    firstName: 'Fatuma',
    lastName: 'Ali',
    dateOfBirth: yearsAgo(34, 10, 3),
    gender: 'FEMALE',
    phone: '+254733000301',
    city: 'Mombasa',
    country: 'Kenya',
    bloodType: 'B+',
    allergies: ['Sulfa drugs'],
    medicalHistory: 'Delivered by spontaneous vaginal delivery. Breastfeeding established.',
    emergencyContactName: 'Hassan Ali',
    emergencyContactPhone: '+254733000302',
    notes: 'Postnatal follow-up and newborn immunization tracking.',
    scenario: 'postpartum-newborn',
  },
  {
    patientId: 'DEMO-0004',
    firstName: 'Lydia',
    lastName: 'Njoroge',
    dateOfBirth: yearsAgo(31, 1, 21),
    gender: 'FEMALE',
    phone: '+254744000401',
    city: 'Nakuru',
    country: 'Kenya',
    bloodType: 'AB+',
    allergies: [],
    medicalHistory: 'Gestational diabetes diagnosed during current pregnancy.',
    emergencyContactName: 'Samuel Njoroge',
    emergencyContactPhone: '+254744000402',
    notes: 'Review glucose log and fetal growth scan.',
    scenario: 'gestational-diabetes',
  },
  {
    patientId: 'DEMO-0005',
    firstName: 'Mary',
    lastName: 'Wambui',
    dateOfBirth: yearsAgo(24, 4, 17),
    gender: 'FEMALE',
    phone: '+254755000501',
    city: 'Eldoret',
    country: 'Kenya',
    bloodType: 'O-',
    allergies: [],
    medicalHistory: 'Missed two scheduled ANC visits. Community follow-up requested.',
    emergencyContactName: 'John Wambui',
    emergencyContactPhone: '+254755000502',
    notes: 'Flagged for outreach and transport support assessment.',
    scenario: 'missed-anc',
  },
  {
    patientId: 'DEMO-0006',
    firstName: 'Joseph',
    lastName: 'Kamau',
    dateOfBirth: yearsAgo(0, 11, 18),
    gender: 'MALE',
    phone: '+254766000601',
    city: 'Thika',
    country: 'Kenya',
    bloodType: 'A-',
    allergies: [],
    medicalHistory: 'Infant patient linked to newborn follow-up scenario.',
    emergencyContactName: 'Monica Kamau',
    emergencyContactPhone: '+254766000602',
    notes: 'Monitor feeding, weight gain, and jaundice history.',
    scenario: 'infant-follow-up',
  },
  {
    patientId: 'DEMO-0007',
    firstName: 'Rose',
    lastName: 'Cherono',
    dateOfBirth: yearsAgo(39, 8, 28),
    gender: 'FEMALE',
    phone: '+254777000701',
    city: 'Kericho',
    country: 'Kenya',
    bloodType: 'B-',
    allergies: ['Latex'],
    medicalHistory: 'Grand multiparity. Previous postpartum hemorrhage.',
    emergencyContactName: 'Daniel Cherono',
    emergencyContactPhone: '+254777000702',
    notes: 'Delivery plan should include blood availability and referral readiness.',
    scenario: 'grand-multiparity',
  },
  {
    patientId: 'DEMO-0008',
    firstName: 'Mercy',
    lastName: 'Achieng',
    dateOfBirth: yearsAgo(26, 3, 11),
    gender: 'FEMALE',
    phone: '+254788000801',
    city: 'Siaya',
    country: 'Kenya',
    bloodType: 'A+',
    allergies: [],
    medicalHistory: 'Postpartum mood concerns. Support person involved in care plan.',
    emergencyContactName: 'Brian Ouma',
    emergencyContactPhone: '+254788000802',
    notes: 'Screen for depression symptoms at each postnatal contact.',
    scenario: 'postpartum-mental-health',
  },
];

async function deleteExistingDemoData(patientIds, userIds) {
  const patientRecords = await prisma.patient.findMany({
    where: { patientId: { in: patientIds } },
    select: { id: true },
  });
  const ids = patientRecords.map((patient) => patient.id);

  if (ids.length > 0) {
    await prisma.auditLog.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.notification.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.medicalRecord.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.appointment.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.immunization.deleteMany({
      where: { newbornRecord: { motherPatientId: { in: ids } } },
    });
    await prisma.newbornRecord.deleteMany({ where: { motherPatientId: { in: ids } } });
    await prisma.pregnancyEpisode.deleteMany({ where: { patientId: { in: ids } } });
  }

  if (userIds.length > 0) {
    await prisma.notification.deleteMany({
      where: {
        userId: { in: userIds },
        metadata: { path: ['seedBatch'], equals: 'demo-clinical' },
      },
    });
  }
}

async function createAppointment(patientId, createdById, data) {
  const startTime = daysFromNow(data.startOffset);
  startTime.setHours(data.hour, data.minute || 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + (data.duration || 45));

  return prisma.appointment.create({
    data: {
      patientId,
      createdById,
      title: data.title,
      description: data.description,
      startTime,
      endTime,
      status: data.status,
      type: data.type,
      location: data.location,
      notes: data.notes,
    },
  });
}

async function main() {
  const staff = await prisma.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER, UserRole.RECEPTIONIST] } },
    select: { id: true, role: true, name: true, email: true },
  });
  const provider = staff.find((user) => user.role === UserRole.HEALTHCARE_PROVIDER) || staff[0];
  const admin = staff.find((user) => user.role === UserRole.ADMIN) || staff[0];
  const receptionist = staff.find((user) => user.role === UserRole.RECEPTIONIST) || staff[0];

  if (!provider || !admin) {
    throw new Error('Run seed:staff before seeding demo clinical data.');
  }

  await deleteExistingDemoData(patients.map((patient) => patient.patientId), staff.map((user) => user.id));

  const savedPatients = new Map();
  for (const patient of patients) {
    const saved = await prisma.patient.upsert({
      where: { patientId: patient.patientId },
      update: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        city: patient.city,
        country: patient.country,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        notes: patient.notes,
        isActive: true,
      },
      create: {
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        city: patient.city,
        country: patient.country,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        notes: patient.notes,
        isActive: true,
      },
    });
    savedPatients.set(patient.scenario, saved);
  }

  const appointments = [];
  appointments.push(await createAppointment(savedPatients.get('high-risk-active-pregnancy').id, provider.id, {
    title: 'High-risk ANC review',
    description: 'Blood pressure review, urine protein check, and danger sign counseling.',
    startOffset: 2,
    hour: 10,
    status: AppointmentStatus.CONFIRMED,
    type: AppointmentType.CONSULTATION,
    location: 'ANC Room 2',
    notes: 'Bring home BP log.',
  }));
  appointments.push(await createAppointment(savedPatients.get('teen-first-pregnancy').id, provider.id, {
    title: 'Iron therapy follow-up',
    description: 'Review hemoglobin symptoms and nutrition support.',
    startOffset: 4,
    hour: 11,
    status: AppointmentStatus.SCHEDULED,
    type: AppointmentType.FOLLOW_UP,
    location: 'Youth-friendly clinic',
  }));
  appointments.push(await createAppointment(savedPatients.get('gestational-diabetes').id, provider.id, {
    title: 'Glucose log and growth scan',
    description: 'Review fasting glucose and schedule fetal growth ultrasound.',
    startOffset: 6,
    hour: 9,
    status: AppointmentStatus.CONFIRMED,
    type: AppointmentType.ULTRASOUND,
    location: 'Ultrasound Suite',
  }));
  appointments.push(await createAppointment(savedPatients.get('missed-anc').id, receptionist.id, {
    title: 'Missed ANC outreach visit',
    description: 'Re-engagement appointment after two missed visits.',
    startOffset: 1,
    hour: 14,
    status: AppointmentStatus.SCHEDULED,
    type: AppointmentType.FOLLOW_UP,
    location: 'Community desk',
  }));
  appointments.push(await createAppointment(savedPatients.get('postpartum-newborn').id, provider.id, {
    title: 'Postnatal and newborn check',
    description: 'Assess maternal recovery, breastfeeding, cord, and newborn weight.',
    startOffset: -5,
    hour: 13,
    status: AppointmentStatus.COMPLETED,
    type: AppointmentType.CONSULTATION,
    location: 'Postnatal Room',
  }));

  const pregnancyData = [
    {
      patient: savedPatients.get('high-risk-active-pregnancy'),
      status: PregnancyStatus.ACTIVE,
      estimatedDueDate: daysFromNow(63),
      lastMenstrualPeriod: daysFromNow(-217),
      gravida: 2,
      para: 1,
      riskLevel: 3,
      highRiskFlags: ['Previous pre-eclampsia', 'Elevated blood pressure'],
      visits: [
        { offset: -70, ga: 18, bp: '126/78', weight: 68.4, fhr: 146, signs: [], interventions: ['Iron and folic acid', 'Birth preparedness counseling'], next: -42 },
        { offset: -35, ga: 23, bp: '138/86', weight: 70.2, fhr: 150, signs: ['Headache reported last week'], interventions: ['Urine protein check', 'BP monitoring plan'], next: 2 },
      ],
    },
    {
      patient: savedPatients.get('teen-first-pregnancy'),
      status: PregnancyStatus.ACTIVE,
      estimatedDueDate: daysFromNow(140),
      lastMenstrualPeriod: daysFromNow(-140),
      gravida: 1,
      para: 0,
      riskLevel: 1,
      highRiskFlags: ['Teen pregnancy', 'Mild anemia'],
      visits: [
        { offset: -21, ga: 17, bp: '108/70', weight: 54.3, fhr: 144, signs: [], interventions: ['Iron therapy', 'Nutrition counseling'], next: 4 },
      ],
    },
    {
      patient: savedPatients.get('gestational-diabetes'),
      status: PregnancyStatus.ACTIVE,
      estimatedDueDate: daysFromNow(84),
      lastMenstrualPeriod: daysFromNow(-196),
      gravida: 3,
      para: 2,
      riskLevel: 2,
      highRiskFlags: ['Gestational diabetes'],
      visits: [
        { offset: -49, ga: 22, bp: '118/72', weight: 76.1, fhr: 142, signs: [], interventions: ['Glucose screening'], next: -14 },
        { offset: -14, ga: 27, bp: '122/76', weight: 77.8, fhr: 148, signs: [], interventions: ['Glucose log review', 'Diet plan'], next: 6 },
      ],
    },
    {
      patient: savedPatients.get('missed-anc'),
      status: PregnancyStatus.LOST_TO_FOLLOW_UP,
      estimatedDueDate: daysFromNow(35),
      lastMenstrualPeriod: daysFromNow(-245),
      gravida: 2,
      para: 1,
      riskLevel: 2,
      highRiskFlags: ['Missed ANC visits', 'Late third trimester'],
      visits: [
        { offset: -91, ga: 20, bp: '112/68', weight: 59.7, fhr: 140, signs: [], interventions: ['Routine ANC package'], next: -63 },
      ],
    },
    {
      patient: savedPatients.get('grand-multiparity'),
      status: PregnancyStatus.ACTIVE,
      estimatedDueDate: daysFromNow(21),
      lastMenstrualPeriod: daysFromNow(-259),
      gravida: 6,
      para: 5,
      riskLevel: 3,
      highRiskFlags: ['Grand multiparity', 'Previous postpartum hemorrhage'],
      visits: [
        { offset: -28, ga: 34, bp: '120/80', weight: 81.4, fhr: 136, signs: [], interventions: ['Delivery plan', 'Referral readiness'], next: 7 },
      ],
    },
  ];

  const pregnancyEpisodes = new Map();
  for (const item of pregnancyData) {
    const episode = await prisma.pregnancyEpisode.create({
      data: {
        patientId: item.patient.id,
        status: item.status,
        estimatedDueDate: item.estimatedDueDate,
        lastMenstrualPeriod: item.lastMenstrualPeriod,
        gravida: item.gravida,
        para: item.para,
        riskLevel: item.riskLevel,
        highRiskFlags: item.highRiskFlags,
        notes: `${item.patient.firstName} is part of the demo scenario: ${item.highRiskFlags.join(', ')}.`,
      },
    });
    pregnancyEpisodes.set(item.patient.patientId, episode);

    for (const visit of item.visits) {
      await prisma.antenatalVisit.create({
        data: {
          pregnancyEpisodeId: episode.id,
          visitDate: daysFromNow(visit.offset),
          gestationalAgeWeeks: visit.ga,
          bloodPressure: visit.bp,
          weight: visit.weight,
          fetalHeartRate: visit.fhr,
          dangerSigns: visit.signs,
          interventions: visit.interventions,
          nextVisitDate: daysFromNow(visit.next),
          recordedBy: provider.name || provider.email,
          notes: 'Seeded ANC note with realistic vitals and care actions.',
        },
      });
    }
  }

  const newborns = [
    {
      mother: savedPatients.get('postpartum-newborn'),
      episode: null,
      name: 'Baby Amina Ali',
      dateOfBirth: daysFromNow(-18),
      sex: 'FEMALE',
      birthWeight: 3.1,
      apgarOneMinute: 8,
      apgarFiveMinutes: 9,
      deliveryFacility: 'MamaMtu Referral Clinic',
      complications: [],
      immunizations: [
        { vaccineName: 'BCG', doseLabel: 'Birth dose', administeredAt: -17, nextDueAt: null, facility: 'MamaMtu Referral Clinic', batchNumber: 'BCG-24-882' },
        { vaccineName: 'OPV', doseLabel: 'Birth dose', administeredAt: -17, nextDueAt: 24, facility: 'MamaMtu Referral Clinic', batchNumber: 'OPV-24-119' },
      ],
    },
    {
      mother: savedPatients.get('postpartum-mental-health'),
      episode: null,
      name: 'Baby Nia Achieng',
      dateOfBirth: daysFromNow(-42),
      sex: 'FEMALE',
      birthWeight: 2.7,
      apgarOneMinute: 7,
      apgarFiveMinutes: 9,
      deliveryFacility: 'Siaya County Hospital',
      complications: ['Neonatal jaundice observed day 3'],
      immunizations: [
        { vaccineName: 'BCG', doseLabel: 'Birth dose', administeredAt: -41, nextDueAt: null, facility: 'Siaya County Hospital', batchNumber: 'BCG-24-740' },
        { vaccineName: 'Penta', doseLabel: 'Dose 1', administeredAt: -1, nextDueAt: 27, facility: 'MamaMtu Outreach', batchNumber: 'PEN-25-041' },
      ],
    },
  ];

  for (const newborn of newborns) {
    const record = await prisma.newbornRecord.create({
      data: {
        motherPatientId: newborn.mother.id,
        pregnancyEpisodeId: newborn.episode?.id,
        name: newborn.name,
        dateOfBirth: newborn.dateOfBirth,
        sex: newborn.sex,
        birthWeight: newborn.birthWeight,
        apgarOneMinute: newborn.apgarOneMinute,
        apgarFiveMinutes: newborn.apgarFiveMinutes,
        deliveryFacility: newborn.deliveryFacility,
        complications: newborn.complications,
        notes: 'Demo newborn record for immunization and postnatal follow-up workflows.',
      },
    });

    for (const immunization of newborn.immunizations) {
      await prisma.immunization.create({
        data: {
          newbornRecordId: record.id,
          vaccineName: immunization.vaccineName,
          doseLabel: immunization.doseLabel,
          administeredAt: daysFromNow(immunization.administeredAt),
          nextDueAt: immunization.nextDueAt === null ? null : daysFromNow(immunization.nextDueAt),
          facility: immunization.facility,
          batchNumber: immunization.batchNumber,
          notes: 'Seeded immunization record.',
        },
      });
    }
  }

  const records = [
    {
      patient: savedPatients.get('high-risk-active-pregnancy'),
      appointmentId: appointments[0].id,
      recordType: RecordType.PRENATAL_VISIT,
      title: 'Elevated blood pressure review',
      description: 'Patient reports intermittent headaches but no visual changes today.',
      diagnosis: 'High-risk pregnancy with hypertension surveillance',
      symptoms: ['Headache', 'Mild ankle swelling'],
      treatment: 'BP monitoring, danger sign education, urine protein testing.',
      medications: ['Iron and folic acid', 'Low-dose aspirin per protocol'],
      vitals: { bloodPressure: '138/86', heartRate: 88, temperature: 36.8, weight: 70.2 },
    },
    {
      patient: savedPatients.get('teen-first-pregnancy'),
      recordType: RecordType.CONSULTATION,
      title: 'Anemia counseling and nutrition plan',
      description: 'Counseled on iron-rich foods, adherence, nausea management, and support person involvement.',
      diagnosis: 'Mild anemia in pregnancy',
      symptoms: ['Fatigue', 'Occasional dizziness'],
      treatment: 'Continue iron therapy and repeat hemoglobin at next visit.',
      medications: ['Ferrous sulfate', 'Folic acid'],
      labResults: [{ testName: 'Hemoglobin', value: '10.1', unit: 'g/dL', status: 'LOW' }],
      vitals: { bloodPressure: '108/70', heartRate: 92, weight: 54.3 },
    },
    {
      patient: savedPatients.get('postpartum-newborn'),
      appointmentId: appointments[4].id,
      recordType: RecordType.GENERAL,
      title: 'Postnatal day 13 review',
      description: 'Mother recovering well. Breastfeeding observed with good latch. Lochia light.',
      diagnosis: 'Routine postnatal recovery',
      symptoms: ['Mild perineal discomfort'],
      treatment: 'Continue postnatal care, return for fever, heavy bleeding, or mood concerns.',
      medications: ['Paracetamol as needed'],
      vitals: { bloodPressure: '116/74', heartRate: 80, temperature: 36.7 },
    },
    {
      patient: savedPatients.get('gestational-diabetes'),
      appointmentId: appointments[2].id,
      recordType: RecordType.LAB_RESULT,
      title: 'Gestational diabetes review',
      description: 'Fasting glucose mostly within range, two elevated post-meal readings after sweet drinks.',
      diagnosis: 'Gestational diabetes, diet controlled',
      symptoms: [],
      treatment: 'Diet plan reinforced. Growth ultrasound scheduled.',
      medications: [],
      labResults: [{ testName: 'Fasting glucose', value: '5.4', unit: 'mmol/L', status: 'NORMAL' }],
      vitals: { bloodPressure: '122/76', weight: 77.8 },
    },
    {
      patient: savedPatients.get('postpartum-mental-health'),
      recordType: RecordType.CONSULTATION,
      title: 'Postpartum mood screening',
      description: 'Patient reports low mood, poor sleep, and worry about feeding. Denies self-harm thoughts.',
      diagnosis: 'Postpartum mood symptoms requiring close follow-up',
      symptoms: ['Low mood', 'Poor sleep', 'Anxiety'],
      treatment: 'Support plan, partner education, follow-up in one week, urgent contacts shared.',
      medications: [],
      vitals: { bloodPressure: '112/72', heartRate: 84 },
    },
  ];

  for (const record of records) {
    await prisma.medicalRecord.create({
      data: {
        patientId: record.patient.id,
        appointmentId: record.appointmentId,
        recordType: record.recordType,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        symptoms: record.symptoms,
        treatment: record.treatment,
        medications: record.medications,
        labResults: record.labResults || undefined,
        vitals: record.vitals,
        healthcareProvider: provider.name || provider.email,
        facility: 'MamaMtu Demo Clinic',
        notes: 'Seeded medical record for demo workflows.',
        recordedBy: provider.id,
      },
    });
  }

  const notificationSeed = [
    {
      userId: provider.id,
      patient: savedPatients.get('high-risk-active-pregnancy'),
      title: 'High-risk ANC review due',
      message: 'Asha Mwangi has a confirmed high-risk ANC review in 2 days. Review BP log and danger signs.',
      type: NotificationType.HIGH_RISK_ALERT,
      priority: 8,
    },
    {
      userId: receptionist.id,
      patient: savedPatients.get('missed-anc'),
      title: 'Outreach needed for missed ANC',
      message: 'Mary Wambui missed two ANC visits. Call and confirm transport needs before tomorrow.',
      type: NotificationType.FOLLOW_UP_REQUIRED,
      priority: 7,
    },
    {
      userId: provider.id,
      patient: savedPatients.get('gestational-diabetes'),
      title: 'Growth scan scheduled',
      message: 'Lydia Njoroge is scheduled for gestational diabetes review and fetal growth scan.',
      type: NotificationType.APPOINTMENT_REMINDER,
      priority: 5,
    },
    {
      userId: admin.id,
      patient: savedPatients.get('postpartum-mental-health'),
      title: 'Postpartum mood follow-up',
      message: 'Mercy Achieng needs a one-week mood follow-up and support-plan check.',
      type: NotificationType.FOLLOW_UP_REQUIRED,
      priority: 6,
    },
  ];

  for (const notification of notificationSeed) {
    await prisma.notification.create({
      data: {
        userId: notification.userId,
        patientId: notification.patient.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        channel: NotificationChannel.IN_APP,
        status: NotificationStatus.PENDING,
        scheduledFor: daysFromNow(1),
        priority: notification.priority,
        metadata: { seedBatch: 'demo-clinical', patientId: notification.patient.patientId },
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        userId: provider.id,
        action: AuditAction.PATIENT_VIEWED,
        resource: 'Patient',
        resourceId: savedPatients.get('high-risk-active-pregnancy').id,
        patientId: savedPatients.get('high-risk-active-pregnancy').id,
        metadata: { seedBatch: 'demo-clinical', reason: 'High-risk ANC chart review' },
      },
      {
        userId: provider.id,
        action: AuditAction.MEDICAL_RECORD_CREATED,
        resource: 'MedicalRecord',
        patientId: savedPatients.get('gestational-diabetes').id,
        metadata: { seedBatch: 'demo-clinical', reason: 'Gestational diabetes lab review' },
      },
      {
        userId: admin.id,
        action: AuditAction.AUTH_EVENT,
        resource: 'User',
        resourceId: admin.id,
        metadata: { seedBatch: 'demo-clinical', event: 'Demo admin session prepared' },
      },
    ],
  });

  console.log(`Demo clinical data ready: ${savedPatients.size} patients, ${appointments.length} appointments, ${records.length} records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
